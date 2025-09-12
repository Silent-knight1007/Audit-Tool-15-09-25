import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: String,
  originalName: String,
  path: String,
  mimeType: String,
  size: Number,
});

const advisorySchema = new mongoose.Schema({
  advisoryId: { type: String, required: true, unique: true },
  advisorytitle: { type: String, required: true },
  Date: { type: Date },
  attachments: [attachmentSchema],
}, { timestamps: true });

const Advisory = mongoose.model('Advisory', advisorySchema);
export default Advisory;
