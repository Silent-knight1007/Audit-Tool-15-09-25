import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: String,          // Stored filename on disk/server
  originalName: String,  // Actual uploaded filename
  path: String,          // File path
  mimeType: String,      // MIME type of the file
  size: Number,          // Size in bytes
});

const guidelineSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  documentName: { type: String, required: true },
  description: { type: String },
  versionNumber: { type: String },
  releaseDate: { type: Date },
  applicableStandard: [{ type: String }],
  attachments: [attachmentSchema], // Add this field
}, { timestamps: true });

const Guideline = mongoose.model('Guideline', guidelineSchema);

export default Guideline;
