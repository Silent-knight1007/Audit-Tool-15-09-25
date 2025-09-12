import express from 'express';
import Policy from '../models/Policy.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

// Upload multiple attachments for a policy
router.post('/:id/attachments', upload.array('attachments'), async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });

    const filesMeta = req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    }));

    policy.attachments.push(...filesMeta);
    await policy.save();

    res.json({ message: 'Files uploaded', attachments: policy.attachments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload attachments', detail: error.message });
  }
});

// List attachments metadata for a policy
router.get('/:id/attachments', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/policies/${policy._id}/attachments`;
    const files = policy.attachments.map(file => ({
      _id: file._id,
      name: file.originalName,
      downloadUrl: `${baseUrl}/${file._id}`
    }));

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve attachment inline or download
router.get('/:policyId/attachments/:fileId', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.policyId);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });

    const file = policy.attachments.id(req.params.fileId);
    if (!file) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(file.path);
    const mime = file.mimeType || 'application/octet-stream';

    if (mime === 'application/pdf' || mime.startsWith('image/')) {
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.sendFile(filePath);
    } else {
      res.download(filePath, file.originalName);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE attachment by ID for a policy
router.delete('/:policyId/attachments/:attachmentId', async (req, res) => {
  try {
    const { policyId, attachmentId } = req.params;

    const policy = await Policy.findById(policyId);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });

    const attachment = policy.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(attachment.path);

    // Delete file from filesystem
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
      } else if (err && err.code === 'ENOENT') {
        console.warn('File already missing, skipping file delete:', filePath);
      }
    });

    // Remove the attachment from MongoDB array
    policy.attachments.pull(attachmentId);
    await policy.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attachment', detail: error.message });
  }
});

// GET all policies
router.get('/', async (req, res) => {
  try {
    const policies = await Policy.find();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// GET a single policy by ID
router.get('/:id', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

// POST create new policy
router.post('/', async (req, res) => {
  try {
    const policy = new Policy(req.body);
    const savedPolicy = await policy.save();
    res.status(201).json(savedPolicy);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create policy' });
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
        $or: [{ policytitle: regex }, { description: regex }],
      };
    }
    const policies = await Policy.find(filter);
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

// PUT update a policy by ID
router.put('/:id', async (req, res) => {
  try {
    const { attachments, ...otherData } = req.body;

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      { ...otherData, attachments },
      { new: true, runValidators: true }
    );

    if (!updatedPolicy) return res.status(404).json({ error: 'Policy not found' });
    res.json(updatedPolicy);
  } catch (err) {
    console.error('Failed to update policy:', err);
    res.status(400).json({ error: 'Failed to update policy', detail: err.message });
  }
});

// DELETE multiple policies (by ids array in req.body.ids)
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No policy IDs provided' });
    }
    await Policy.deleteMany({ _id: { $in: ids } });
    res.json({
      message: 'Policies deleted successfully',
      deletedIds: ids
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete policies' });
  }
});

export default router;
