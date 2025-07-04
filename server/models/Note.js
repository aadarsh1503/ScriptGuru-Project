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
 
  lastUpdatedBy: {
    type: String,
    default: 'Anonymous' 
  }

}, {

  timestamps: true 
});

module.exports = mongoose.model('Note', NoteSchema);