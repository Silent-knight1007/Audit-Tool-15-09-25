import express from 'express';
import Template from '../models/Template.js';
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

// Upload multiple attachments for a template
router.post('/:id/attachments', upload.array('attachments'), async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const filesMeta = req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    }));

    template.attachments.push(...filesMeta);
    await template.save();

    res.json({ message: 'Files uploaded', attachments: template.attachments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload attachments', detail: error.message });
  }
});

// List attachments metadata for a template
router.get('/:id/attachments', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/api/templates/${template._id}/attachments`;
    const files = template.attachments.map(file => ({
      _id: file._id,
      name: file.originalName,
      downloadUrl: `${baseUrl}/${file._id}`
    }));

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve attachment file inline or download
router.get('/:templateId/attachments/:fileId', async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const file = template.attachments.id(req.params.fileId);
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

// DELETE attachment by ID for template
router.delete('/:templateId/attachments/:attachmentId', async (req, res) => {
  try {
    const { templateId, attachmentId } = req.params;

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const attachment = template.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(attachment.path);

    // Delete file from filesystem
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
      }
    });

    // Remove attachment from DB array
    template.attachments.pull(attachmentId);
    await template.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attachment', detail: error.message });
  }
});

// GET all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET a single template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST create new template
router.post('/', async (req, res) => {
  try {
    const template = new Template(req.body);
    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create template' });
  }
});

// PUT update a template by ID
router.put('/:id', async (req, res) => {
  try {
    const { attachments, ...otherData } = req.body;

    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Update attachments array if present
    if (attachments) {
      template.attachments = attachments;
    }

    Object.assign(template, otherData);

    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update template', detail: err.message });
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
        $or: [{ templatename: regex }, { description: regex }],
      };
    }
    const templates = await Template.find(filter);
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// DELETE multiple templates (by ids array in req.body.ids)
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No template IDs provided' });
    }
    await Template.deleteMany({ _id: { $in: ids } });
    res.json({
      message: 'Templates deleted successfully',
      deletedIds: ids
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete templates' });
  }
});

export default router;
