// routes/advisories.js
import express from 'express';
import Advisory from '../models/Advisory.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Initialize router first
const router = express.Router();

// Setup uploads directory
const uploadDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

// Allowed Extensions
const allowedExt = ['.jpeg', '.jpg', '.png', '.xls', '.doc', '.docx', '.pdf'];
// Multer with fileFilter
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpeg, jpg, png, xls, doc, docx, and pdf files are allowed!'), false);
    }
  }
});

// ======= Attachment Routes =======

// Your attachments upload route, with Multer error handling
router.post('/:id/attachments', (req, res, next) => {
  upload.array('attachments')(req, res, function (err) {
    if (err) {
      // This will catch Multer file type errors and others
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    // ...the rest of your logic as before
    const advisory = await Advisory.findById(req.params.id);
    if (!advisory) return res.status(404).json({ error: 'Advisory not found' });

    const filesMeta = req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    }));

    advisory.attachments.push(...filesMeta);
    await advisory.save();

    res.json({ message: 'Files uploaded', attachments: advisory.attachments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload attachments', detail: error.message });
  }
});


// List attachments metadata for an advisory
router.get('/:id/attachments', async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    if (!advisory) return res.status(404).json({ error: 'Advisory not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/advisories/${advisory._id}/attachments`;
    const files = advisory.attachments.map(file => ({
      _id: file._id,
      name: file.originalName,
      downloadUrl: `${baseUrl}/${file._id}`
    }));

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes/advisories.js
router.get('/:advisoryId/attachments/:fileId', async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.advisoryId);
    if (!advisory) return res.status(404).json({ error: 'Advisory not found' });

    const file = advisory.attachments.id(req.params.fileId);
    if (!file) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(file.path);
    const mime = file.mimeType || 'application/octet-stream';

    // Only display inline for browser-viewable types (PDF, images)
    if (mime === 'application/pdf' || mime.startsWith('image/')) {
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.sendFile(filePath);
    } else {
      // For all other types, force download
      res.download(filePath, file.originalName);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a single attachment from an advisory
router.delete('/:advisoryId/attachments/:fileId', async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.advisoryId);
    if (!advisory) return res.status(404).json({ error: 'Advisory not found' });

    // Find index of the attachment to remove
    const index = advisory.attachments.findIndex(file => file._id.toString() === req.params.fileId);
    if (index === -1) return res.status(404).json({ error: 'Attachment not found' });

    const file = advisory.attachments[index];

    // Delete the physical file from disk
    const fs = await import('fs');
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Remove attachment from the array
    advisory.attachments.splice(index, 1);

    // Save the updated advisory document
    await advisory.save();

    res.json({ message: 'Attachment deleted successfully', attachmentId: req.params.fileId });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment', detail: error.message });
  }
});


// ======= Advisory CRUD Routes =======

// Get all advisories
router.get('/', async (req, res) => {
  try {
    const advisories = await Advisory.find();
    res.json(advisories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch advisories' });
  }
});

// Get advisory by ID
router.get('/:id', async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    if (!advisory) return res.status(404).json({ error: 'Advisory not found' });
    res.json(advisory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch advisory' });
  }
});

//searchbar route
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter = {
        $or: [{ advisorytitle: regex }, { description: regex }],
      };
    }
    const advisories = await Advisory.find(filter);
    res.json(advisories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch advisories' });
  }
});

// Create a new advisory
router.post('/', async (req, res) => {
  try {
    const advisory = new Advisory(req.body);
    const savedAdvisory = await advisory.save();
    res.status(201).json(savedAdvisory);
  } catch (err) {
  console.error('Advisory creation error:', err);
  res.status(400).json({ error: err.message });
}
});

// Update advisory by ID (only certain fields allowed)
router.put('/:id', async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    if (!advisory) {
      return res.status(404).json({ error: 'Advisory not found' });
    }

    // Only update specific fields — advisoryId stays the same
    if (req.body.advisorytitle !== undefined) {
      advisory.advisorytitle = req.body.advisorytitle;
    }
    if (req.body.Date !== undefined) {
      const parsedDate = new Date(req.body.Date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      advisory.Date = parsedDate;
    }

    const updated = await advisory.save();
    res.json(updated);

  } catch (err) {
    console.error('Error updating advisory:', err);
    res.status(400).json({ error: 'Failed to update advisory', detail: err.message });
  }
});

// Delete multiple advisories by IDs
router.delete('/', async (req, res) => {
  try {
    const { ids, role } = req.body; // get role from request body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No advisory IDs provided' });
    }

    if (role === 'user') {
      return res.status(403).json({ error: 'Forbidden: Users cannot delete organisational documents' });
    }

    await Advisory.deleteMany({ _id: { $in: ids } });
    res.json({
      message: 'Advisories deleted successfully',
      deletedIds: ids
    });
  } catch (err) {
    console.error('Delete advisories error:', err);
    res.status(500).json({ error: 'Failed to delete advisories', details: err.message });
  }
});


export default router;
