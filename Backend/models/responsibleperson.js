import mongoose from 'mongoose';

const ResponsiblePersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});


const ResponsiblePerson = mongoose.model('ResponsiblePerson', ResponsiblePersonSchema);

export default ResponsiblePerson;
