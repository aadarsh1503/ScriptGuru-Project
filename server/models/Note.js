const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  // --- This is the new field you need to add ---
  lastUpdatedBy: {
    type: String,
    default: 'Anonymous' // A sensible default value
  }
  // We have removed your manual 'updatedAt' field
}, {
  // --- This is the Mongoose best practice for handling timestamps ---
  // It automatically creates and manages 'createdAt' and 'updatedAt' fields.
  timestamps: true 
});

module.exports = mongoose.model('Note', NoteSchema);