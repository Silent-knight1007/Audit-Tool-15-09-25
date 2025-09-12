// routes/guideline.js
import express from 'express';
import Guideline from '../models/Guideline.js';
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
  },
});
const upload = multer({ storage });

/* ========== ATTACHMENTS ========== */

// Upload attachments
router.post('/:id/attachments', upload.array('attachments'), async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id);
    if (!guideline) return res.status(404).json({ error: 'Guideline not found' });

    const filesMeta = req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    }));

    guideline.attachments.push(...filesMeta);
    await guideline.save();

    res.json({ message: 'Files uploaded', attachments: guideline.attachments });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ error: 'Failed to upload attachments', detail: error.message });
  }
});

// List attachments
router.get('/:id/attachments', async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id);
    if (!guideline) return res.status(404).json({ error: 'Guideline not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/guidelines/${guideline._id}/attachments`;
    const files = guideline.attachments.map(file => ({
      _id: file._id,
      name: file.originalName,
      downloadUrl: `${baseUrl}/${file._id}`,
    }));

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve attachment
router.get('/:guidelineId/attachments/:fileId', async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.guidelineId);
    if (!guideline) return res.status(404).json({ error: 'Guideline not found' });

    const file = guideline.attachments.id(req.params.fileId);
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

// Delete an attachment
router.delete('/:guidelineId/attachments/:fileId', async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.guidelineId);
    if (!guideline) return res.status(404).json({ error: 'Guideline not found' });

    const fileIndex = guideline.attachments.findIndex(f => f._id.toString() === req.params.fileId);
    if (fileIndex === -1) return res.status(404).json({ error: 'Attachment not found' });

    const file = guideline.attachments[fileIndex];

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    guideline.attachments.splice(fileIndex, 1);
    await guideline.save();

    res.json({ message: 'Attachment deleted successfully', attachmentId: req.params.fileId });
  } catch (error) {
    console.error('Delete guideline attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment', detail: error.message });
  }
});

/* ========== GUIDELINES CRUD ========== */

// GET all guidelines
router.get('/', async (req, res) => {
  try {
    const guidelines = await Guideline.find();
    res.json(guidelines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guidelines' });
  }
});

// GET a single guideline
router.get('/:id', async (req, res) => {
  try {
    const guideline = await Guideline.findById(req.params.id);
    if (!guideline) return res.status(404).json({ error: 'Guideline not found' });
    res.json(guideline);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guideline' });
  }
});

// POST create guideline
router.post('/', async (req, res) => {
  try {
    if (!req.body.documentId) {
      return res.status(400).json({ error: "documentId is required and must be unique" });
    }
    const guideline = new Guideline(req.body);
    const savedGuideline = await guideline.save();
    res.status(201).json(savedGuideline);
  } catch (err) {
    console.error('Guideline validation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// PUT update guideline (documentId immutable, attachments handled separately)
router.put('/:id', async (req, res) => {
  try {
    const { documentId, attachments, ...updatableFields } = req.body;

    const updatedGuideline = await Guideline.findByIdAndUpdate(
      req.params.id,
      { $set: updatableFields },
      { new: true, runValidators: true }
    );

    if (!updatedGuideline) return res.status(404).json({ error: 'Guideline not found' });

    res.json(updatedGuideline);
  } catch (err) {
    console.error('Guideline update error:', err);
    res.status(400).json({ error: err.message });
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
        $or: [{ guidelinetitle: regex }, { description: regex }],
      };
    }
    const guidelines = await Guideline.find(filter);
    res.json(guidelines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch guidelines' });
  }
});

// DELETE multiple guidelines
router.delete('/', async (req, res) => {
  try {
    const { ids,role } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No guideline IDs provided' });
    }
    if (role === 'user') {
      return res.status(403).json({ error: 'Forbidden: Users cannot delete guidelines' });
    }
    await Guideline.deleteMany({ _id: { $in: ids } });
    res.json({
      message: 'Guidelines deleted successfully',
      deletedIds: ids
    });
  } catch (err) {
    console.error('Delete advisories error:', err);
    res.status(500).json({ error: 'Failed to delete advisories', details: err.message });
  }
});

export default router;
