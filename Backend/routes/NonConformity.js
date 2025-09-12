import mongoose from 'mongoose';
import express from 'express';
import NonConformity from '../models/NonConformity.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
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
    if (extname) return cb(null, true);
    cb(new Error('File type not allowed'));
  }
});

// UPDATE a NonConformity by ID
router.put('/:id', upload.array('attachments'), async (req, res) => {
  try {
    const { userId, userRole, ...restBody } = req.body;

    if (!userId || !userRole) {
      return res.status(400).json({ message: 'User info missing' });
    }

    const nc = await NonConformity.findById(req.params.id);
    if (!nc) {
      return res.status(404).json({ message: 'NonConformity not found' });
    }

    // Authorization based on responsibleperson
    if (userRole !== 'admin' && userRole !== 'auditor') {
      if (nc.responsibleperson.toString() !== userId) {
        return res.status(403).json({ message: 'Forbidden: not authorized to update this NonConformity' });
      }
    }

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

    const updateData = { ...restBody };

    // Validate and convert responsibleperson to ObjectId
    const responsiblePersonIdString = restBody.responsibleperson || userId;

    if (!mongoose.Types.ObjectId.isValid(responsiblePersonIdString)) {
      return res.status(400).json({ message: 'Invalid responsibleperson user ID' });
    }

    updateData.responsibleperson = new mongoose.Types.ObjectId(responsiblePersonIdString);

    if (attachments.length > 0) {
      updateData.attachments = attachments;
    }

    const updatedNC = await NonConformity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedNC) {
      return res.status(404).json({ message: 'NonConformity not found' });
    }
    res.json(updatedNC);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//create new NonConformity
router.post('/', upload.array('attachments'), async (req, res) => {
  const { userId, userRole, ...restBody } = req.body;

  const requiredFields = [
    'auditId', 'ncDescription', 'ncClauseNo', 'ncType', 'dueDate', 'department',
    'responsibleperson', 'responsiblepersonmail', 'nclocation',
    'ncRootCause', 'ncstatus'
  ];
  const missing = requiredFields.filter(field => !restBody[field]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }
  if (!userId || !userRole) {
    return res.status(400).json({ error: 'User info missing' });
  }

  function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
  }

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

    const responsiblePersonIdString = restBody.responsibleperson || userId;

    if (!isValidObjectId(responsiblePersonIdString)) {
      return res.status(400).json({ error: 'Invalid responsibleperson user ID' });
    }

    const responsiblePersonId = new mongoose.Types.ObjectId(responsiblePersonIdString);

    const nc = new NonConformity({
      ...restBody,
      responsibleperson: responsiblePersonId,
      attachments
    });

    await nc.save();
    res.status(201).json({ message: 'NonConformity saved', ncId: nc.ncId });
  } catch (err) {
    console.error('NonConformity save error:', err);
    res.status(500).json({ error: 'Error saving NonConformity', details: err.message });
  }
});

// GET all NonConformities
router.get('/', async (req, res) => {
  try {
    let user = null;
    if (req.body.user) user = JSON.parse(req.body.user);
    else if (req.query.user) user = JSON.parse(req.query.user);
    else if (req.headers.user) user = JSON.parse(req.headers.user);

    if (!user || !user._id || !user.role) {
      return res.status(401).json({ message: 'Unauthorized: user info missing' });
    }

    let filter = {};
    if (user.role !== 'admin' && user.role !== 'auditor') {
      filter.responsibleperson = user._id;
    }

    const nonConformities = await NonConformity.find(filter).populate('responsibleperson');
    res.json(nonConformities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single NonConformity by ID
router.get('/:id', async (req, res) => {
  try {
    const nc = await NonConformity.findById(req.params.id);
    if (!nc) {
      return res.status(404).json({ message: 'NonConformity not found' });
    }
    res.json(nc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE multiple NonConformities by IDs
router.delete('/', async (req, res) => {
  const { ids } = req.body;
  try {
    await NonConformity.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting nonconformities', error: err });
  }
});

export default router;
