import express from 'express';
import AuditPlan from '../models/AuditPlan.js'; // Adjust path if needed
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists or create it
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|doc|docx|pdf|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  }
});

// POST: Create new AuditPlan with attachments
router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    const newAudit = new AuditPlan({
      ...req.body,
      attachments
    });
    await newAudit.save();
    res.status(201).json({ id: newAudit.auditId });
  } catch (err) {
    console.error('AuditPlan POST error:', err);
    res.status(500).json({ error: err.message, details: err.errors });
  }
});

// GET: Fetch all Audit Plans
router.get('/', async (req, res) => {
  try {
    const audits = await AuditPlan.find();
    res.json(audits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single AuditPlan by ID
router.get('/:id', async (req, res) => {
  try {
    const audit = await AuditPlan.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ message: 'Audit Plan not found' });
    }
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE an AuditPlan by ID
router.put('/:id', upload.array('attachments'), async (req, res) => {
  try {
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    const updateData = {
      ...req.body,
    };
    if (attachments.length > 0) {
      updateData.attachments = attachments;
    }

    const updatedAudit = await AuditPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedAudit) {
      return res.status(404).json({ message: 'Audit Plan not found' });
    }
    res.json(updatedAudit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Delete multiple Audit Plans (ONLY if status is 'planned')
router.delete('/audits', async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs provided for deletion." });
  }

  try {
    // Ensure all ids are ObjectId
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const auditsToDelete = await AuditPlan.find({ _id: { $in: objectIds } });

    // Filter only audits with status = 'planned'
    const allowedIds = auditsToDelete
      .filter(
        audit =>
          typeof audit.status === "string" &&
          audit.status.trim().toLowerCase() === "planned"
      )
      .map(audit => audit._id.toString()); // Convert ObjectId to string

    if (allowedIds.length === 0) {
      return res.status(400).json({ message: 'No audits with status "planned" can be deleted.' });
    }

    const result = await AuditPlan.deleteMany({ _id: { $in: allowedIds } });
    res.status(200).json({
      message: `${result.deletedCount} audit(s) deleted.`,
      deletedIds: allowedIds.map(id => id.toString())
    });

  } catch (error) {
    console.error('Error deleting audits:', error);
    res.status(500).json({ message: 'Server error during delete.', error: error.message });
  }
});


export default router;
