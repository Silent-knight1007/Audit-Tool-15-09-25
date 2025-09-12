import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/user.js';  // Ensure this matches the filename casing (user.js or User.js)

const router = express.Router();

const dir = './uploads/avatars';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },  
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID missing' });
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.avatarUrl) {
      const oldPath = path.join(process.cwd(), user.avatarUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.avatarUrl = avatarPath;
    await user.save();

    res.json({ avatarUrl: avatarPath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    console.log('Upload request body:', req.body);
    console.log('Uploaded file:', req.file);
    res.status(500).json({ error: err.message || 'Failed to upload avatar' });
  }
});

export default router;
