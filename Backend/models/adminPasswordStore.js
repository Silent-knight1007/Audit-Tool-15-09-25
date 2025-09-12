import mongoose from 'mongoose';

const adminPasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  plainPassword: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
}, { timestamps: true });

const AdminPassword = mongoose.model('AdminPassword', adminPasswordSchema, 'admin');

export default AdminPassword;
