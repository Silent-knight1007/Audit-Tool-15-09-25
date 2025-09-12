import express from 'express';
import Certificate from '../models/Certificate.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Setup uploads folder
const uploadDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config to store files
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '_'); // Use normal underscore without escaping
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

/* ========== ATTACHMENTS ========== */

// Upload attachments for certificate
router.post('/:id/attachments', upload.array('attachments'), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const filesMeta = req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    }));

    certificate.attachments.push(...filesMeta);
    await certificate.save();

    res.json({ message: 'Files uploaded', attachments: certificate.attachments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload attachments', detail: error.message });
  }
});

// List attachments metadata
router.get('/:id/attachments', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/certificates/${certificate._id}/attachments`;
    const files = certificate.attachments.map(file => ({
      _id: file._id,
      name: file.originalName,
      downloadUrl: `${baseUrl}/${file._id}`
    }));

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve attachment (inline or download)
router.get('/:certificateId/attachments/:fileId', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const file = certificate.attachments.id(req.params.fileId);
    if (!file) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(file.path);
    const mime = file.mimeType || 'application/octet-stream';

    // Check if file exists before serving
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist; return user-friendly error
        return res.status(404).json({ message: 'Attachment file not found on server', error: err.message });
      }

      if (mime === 'application/pdf' || mime.startsWith('image/')) {
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        res.sendFile(filePath);
      } else {
        res.download(filePath, file.originalName);
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE attachment by ID
router.delete('/:certificateId/attachments/:attachmentId', async (req, res) => {
  try {
    const { certificateId, attachmentId } = req.params;

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const attachment = certificate.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(attachment.path);

    console.log('Attempting to delete attachment file at:', filePath);

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
      } else if (err && err.code === 'ENOENT') {
        console.warn('File already missing, skipping file delete:', filePath);
      }
    });

    // FIX: Remove the attachment by its id using Mongoose array pull
    certificate.attachments.pull(attachmentId);

    await certificate.save();

    console.log(`Attachment ${attachmentId} deleted from certificate ${certificateId}`);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete attachment:', error);
    res.status(500).json({ error: 'Failed to delete attachment', detail: error.message });
  }
});

/*==========CERTIFICATES CRUD========== */
   
// GET all certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// GET single certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// POST create certificate
router.post('/', async (req, res) => {
  try {
    const { issueDate, validThrough, ...rest } = req.body;

    // Convert strings to Date and validate
    const issue = new Date(issueDate);
    const valid = new Date(validThrough);
    if (!(issue instanceof Date) || isNaN(issue) || !(valid instanceof Date) || isNaN(valid)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (valid <= issue) {
      return res.status(400).json({ error: 'Valid Through date must be after Issue Date' });
    }

    const certificate = new Certificate({
      ...rest,
      issueDate: issue,
      validThrough: valid
    });

    const savedCertificate = await certificate.save();
    res.status(201).json(savedCertificate);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create certificate', detail: err.message });
  }
});

// PUT update certificate by ID
router.put('/:id', async (req, res) => {
  try {
    const { issueDate, validThrough, attachments, ...rest } = req.body; // Extract attachments explicitly

    // Remove documentId if present in the update data to prevent editing
    if ('documentId' in rest) {
      delete rest.documentId;
    }

    // Convert strings to Date and validate if provided
    let issue, valid;
    if (issueDate) {
      issue = new Date(issueDate);
      if (!(issue instanceof Date) || isNaN(issue)) {
        return res.status(400).json({ error: 'Invalid Issue Date format' });
      }
    }
    if (validThrough) {
      valid = new Date(validThrough);
      if (!(valid instanceof Date) || isNaN(valid)) {
        return res.status(400).json({ error: 'Invalid Valid Through format' });
      }
    }
    if (issue && valid && valid <= issue) {
      return res.status(400).json({ error: 'Valid Through date must be after Issue Date' });
    }

    // Find the certificate by ID
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    // Update attachments if provided (replace existing attachments array)
    if (attachments) {
      certificate.attachments = attachments;
    }

    // Update other fields
    Object.assign(certificate, { ...rest, ...(issue ? { issueDate: issue } : {}), ...(valid ? { validThrough: valid } : {}) });

    // Save the updated certificate
    const updatedCertificate = await certificate.save();

    res.json(updatedCertificate);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update certificate', detail: err.message });
  }
});

// searchbar route 
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter = {
        $or: [{ certificatename: regex }, { description: regex }],
      };
    }
    const certificates = await Certificate.find(filter);
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// DELETE multiple certificates
router.delete('/', async (req, res) => {
  try {
    const { ids, role } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No certificate IDs provided' });
    }
    if (role === 'user') {
      return res.status(403).json({ error: 'Forbidden: Users cannot delete certificates' });
    }

    await Certificate.deleteMany({ _id: { $in: ids } });
    res.json({
      message: 'Certificates deleted successfully',
      deletedIds: ids
    });
  } catch (err) {
    console.error('Delete certificates error:', err);
    res.status(500).json({ error: 'Failed to delete certificates', details: err.message });
  }
});

export default router;