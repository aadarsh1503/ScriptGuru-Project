export default function NoteForm({ title, setTitle, onSubmit, isSubmitting, buttonText }) {
    return (
      // *** FIX: Added className="note-form" to the form tag ***
      <form onSubmit={onSubmit} className="note-form"> 
         <div>
        <label htmlFor="title" className="form-label">Note Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input "
          placeholder="My meeting notes..."
          required
          autoFocus
        />
      </div>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="glow-button"
        >
          {isSubmitting ? 'Creating...' : 'Launch Note Room'}
        </button>
      </form>
    );
}