const express = require('express');
const router = express.Router();
const { createNote, getNoteById, updateNote , getAllNotes ,deleteNote } = require('../controllers/noteController');

// POST /api/notes
router.post('/', createNote);

// GET /api/notes/:id
router.get('/:id', getNoteById); 
router.get('/', getAllNotes); 

// PUT /api/notes/:id
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;