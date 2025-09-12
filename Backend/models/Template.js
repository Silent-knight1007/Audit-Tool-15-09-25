import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: String,          // server stored filename
  originalName: String,  // uploaded filename
  path: String,          // file path on server
  mimeType: String,      // file MIME type
  size: Number,          // file size in bytes
});

const templateSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  documentName: { type: String, required: true },
  description: { type: String },
  versionNumber: { type: String },
  releaseDate: { type: Date },
  applicableStandard: [{ type: String }],
  attachments: [attachmentSchema],  // <-- Add this
}, { timestamps: true });


const Template = mongoose.model('Template', templateSchema);

export default Template;
