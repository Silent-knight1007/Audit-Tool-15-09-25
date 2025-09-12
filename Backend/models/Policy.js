import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: String,          // stored file name on disk/server
  originalName: String,  // original uploaded file name
  path: String,          // path on server
  mimeType: String,      // MIME type of file
  size: Number,          // file size in bytes
});

const policySchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  documentName: { type: String, required: true },
  description: { type: String },
  versionNumber: { type: String },
  releaseDate: { type: Date },
   applicableStandard: [{ type: String }],
  attachments: [attachmentSchema],  // add this to store uploaded files metadata
}, { timestamps: true });

const Policy = mongoose.model('Policy', policySchema);

export default Policy;
