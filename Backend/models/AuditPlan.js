import mongoose from 'mongoose';

// Audit Plan schema/model
const auditplanSchema = new mongoose.Schema({
  auditId: { type: String, unique: true }, // Ensure uniqueness

  auditType: String,

  standards: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one standard must be selected.']
  },

  location: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one location must be selected.']
  },

  leadAuditor: String,

  auditTeam: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one location must be selected.']
  },

  plannedDate: Date,

  status: String,

  actualDate: Date,

  completeDate: Date,

  criteria: String,

  scope: String,

  attachments: [
    {
      filename: String, // The name stored on disk
      originalname: String, // The original file name
      mimetype: String,
      size: Number,
      path: String // Optional: relative path to the file
    }
  ]
});

// Auto-generate AUDxxx ID before saving
auditplanSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    // Get all existing auditIds from the Audit collection
    const audits = await mongoose.model('Audit').find({}, 'auditId').lean();

    // Extract numeric parts of auditIds and sort them
    const usedNumbers = audits
      .map(a => parseInt((a.auditId || '').replace('AUD', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    // Find the smallest unused number starting from 1
    let newNumber = 1;
    for (const num of usedNumbers) {
      if (num === newNumber) {
        newNumber++;
      } else if (num > newNumber) {
        break;
      }
    }

    // Assign the new auditId
    this.auditId = `AUD${newNumber.toString().padStart(3, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Remove model from mongoose.models if it exists (for hot-reloading in dev)
delete mongoose.connection.models['Audit'];

const Audit = mongoose.models.Audit || mongoose.model('Audit', auditplanSchema);

export default Audit;
