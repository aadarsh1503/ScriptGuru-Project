const Note = require('../models/Note');

// @desc    Create a new note
// @route   POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title } = req.body;
    // Validate that title exists
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Note title is required.' });
    }
    
    const note = new Note({ title });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error('Error in createNote:', err.message);
    res.status(500).json({ message: 'Server error while creating the note.' });
  }
};

// @desc    Get a single note by its ID
// @route   GET /api/notes/:id
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    
    res.json(note);
  } catch (err) {
    console.error('Error in getNoteById:', err.message);
    // Handle invalid ObjectId format error
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Note not found.' });
    }
    res.status(500).json({ message: 'Server error while fetching the note.' });
  }
};
// @desc    Get all notes (without their content for efficiency)
// @route   GET /api/notes
exports.getAllNotes = async (req, res) => {
    try {
      const notes = await Note.find({})
        .select('title updatedAt') // Only select the title and updatedAt fields
        .sort({ updatedAt: -1 });  // Sort by most recently updated
  
      res.json(notes);
    } catch (err) {
      console.error('Error in getAllNotes:', err.message);
      res.status(500).json({ message: 'Server error while fetching notes.' });
    }
  };
  exports.deleteNote = async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      await note.deleteOne(); // Use deleteOne() on the document
  
      res.json({ message: 'Note removed successfully' });
    } catch (err) {
      console.error('Error in deleteNote:', err.message);
      res.status(500).json({ message: 'Server error while deleting the note.' });
    }
  };
// @desc    Update a note's content (fallback, not used in primary real-time flow)
// @route   PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Note: Mongoose `timestamps: true` will handle `updatedAt` automatically.
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { content }, // Only update the content
      { new: true, runValidators: true } // {new: true} returns the updated document
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    
    res.json(note);
  } catch (err) {
    console.error('Error in updateNote:', err.message);
    res.status(500).json({ message: 'Server error while updating the note.' });
  }
};