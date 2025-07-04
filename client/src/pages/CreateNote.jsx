import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NoteForm from '../components/NoteForm';
import { toast } from 'react-toastify';   // <<< 1. Import toast
import { FaTrash } from 'react-icons/fa'; // <<< 2. Import the Trash Icon

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CreateNote() {
  // State for the creation form
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  
  // State for the list of existing notes
  const [existingNotes, setExistingNotes] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    const fetchExistingNotes = async () => {
      try {
        setIsLoadingList(true);
        const response = await fetch(`${API_URL}/api/notes`);
        if (!response.ok) throw new Error('Could not fetch existing notes.');
        const data = await response.json();
        setExistingNotes(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load existing notes.'); // Toast on fetch error
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchExistingNotes();
  }, []);

  // --- MODIFIED HANDLERS WITH TOASTS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error('Failed to create note on the server.');
      
      const data = await response.json();
      toast.success(`Note room "${title}" created successfully!`); // <<< 3. Toast on creation
      navigate(`/notes/${data._id}`);
      
    } catch (err) {
      console.error('Error creating note:', err);
      toast.error(err.message || 'Error creating note.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (noteId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to permanently delete this note room?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete the note.');

      // Find the note title for a better toast message
      const deletedNoteTitle = existingNotes.find(n => n._id === noteId)?.title || 'Note';

      setExistingNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      toast.success(`"${deletedNoteTitle}" was deleted.`); // <<< 4. Toast on deletion
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while deleting.');
    }
  };

  return (
    <>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2 className="form-title">Create a New Note Room</h2>
        <NoteForm
          title={title}
          setTitle={setTitle}
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
          buttonText="Launch Note Room"
        />
      </div>

      <div className="existing-notes-section">
        <h3 className="existing-notes-header">Or Join an Existing Room</h3>
        {isLoadingList ? (
          <div className="loader"></div>
        ) : (
          <div className="existing-notes-list">
            {existingNotes.length > 0 ? (
              existingNotes.map(note => (
                <Link to={`/notes/${note._id}`} key={note._id} className="note-list-item-wrapper">
                  <div className="note-list-item">
                    <div className="note-list-item-content">
                      <span className="note-list-item-title">{note.title}</span>
                      <span className="note-list-item-date">
                        Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      className="delete-button" 
                      onClick={(e) => handleDelete(note._id, e)}
                      title="Delete Note"
                    >
                      <FaTrash /> {/* <<< 5. Using the React Icon component */}
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no-notes-message">No existing rooms found. Create the first one!</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}