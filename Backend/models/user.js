import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: null },
  role: { type: String, default: 'User' },  // Added role field for frontend display
  // Add other user-related fields as needed, e.g., password, etc.
}, { timestamps: true });

// Use model name capitalized and singular for consistency
const user = mongoose.model('user', userSchema);

export default user;
// XyZ7$pQr1@9nLm