import express from 'express';
import ResponsiblePerson from '../models/responsibleperson.js'; // Note the .js extension!
const router = express.Router();

// GET all responsible persons
router.get('/', async (req, res) => {
  try {
    const people = await ResponsiblePerson.find({});
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
