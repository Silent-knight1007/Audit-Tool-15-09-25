import mongoose from 'mongoose';

const nonConformitySchema = new mongoose.Schema({
  auditId: { type: String, required: true },
  ncId: { type: String, required: true, unique: true }, // Auto-generated, unique, e.g. NC001
  ncDescription: String,
  ncClauseNo: String,
  ncType: String,
  reportingDate : Date,
  dueDate: Date,
  department: String,
  responsibleperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responsiblepersonmail: String,
  nclocation: String,
  ncCorrectiveAction: String,
  ncPreventiveAction: String,
  ncRootCause: String,
  ncstatus: String,
  attachments: [
    {
      filename: String, // The name stored on disk
      originalname: String, // The original file name
      mimetype: String,
      size: Number,
      path: String // Optional: relative path to the file
    }
  ]
  // ...add other fields as needed
});

// Pre-validate hook to auto-generate ncId
nonConformitySchema.pre('validate', async function (next) {
  console.log('Pre-validate hook running for auditId:', this.auditId);
  if (!this.isNew) return next();

  try {
    if (!this.auditId) {
      return next(new Error('auditId is required to generate ncId'));
    }
    const count = await mongoose.model('NonConformity').countDocuments({ auditId: this.auditId });
    const serial = String(count + 1).padStart(3, '0');
    this.ncId = `${this.auditId}NC${serial}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Remove model from mongoose.models if it exists (for hot-reloading in dev)
delete mongoose.connection.models['NonConformity'];

const NonConformity = mongoose.model('NonConformity', nonConformitySchema);

export default NonConformity;
