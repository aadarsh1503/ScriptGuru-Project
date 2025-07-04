import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '../components/Editor';
import ActiveUsers from '../components/ActiveUsers';
import CopyLinkButton from '../components/CopyLinkButton'; // Make sure this component exists

// Define API URL from environment variables, with a fallback for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * StatusIndicator Component: Displays the current save status with a colored dot.
 * This is a good example of a small, reusable component within a larger page component.
 */
const StatusIndicator = ({ status }) => {
  // Determine class and text based on the status prop
  let statusClass = '';
  let text = '';

  switch (status) {
    case 'Connected':
    case 'Saved':
      statusClass = 'status-saved';
      text = 'Saved to Cloud';
      break;
    case 'Unsaved':
      statusClass = 'status-unsaved';
      text = 'Unsaved Changes';
      break;
    case 'Saving...':
      statusClass = 'status-saving';
      text = 'Saving...';
      break;
    case 'Error':
      statusClass = 'status-error';
      text = 'Connection Error';
      break;
    default:
      statusClass = 'status-connecting';
      text = 'Connecting...';
  }

  return (
    <div className={`status-indicator ${statusClass}`}>
      <div className="dot"></div>
      <span>{text}</span>
    </div>
  );
};

/**
 * NotePage Component: The main view for collaborating on a single note.
 * Handles fetching note data, establishing a WebSocket connection,
 * and synchronizing content in real-time.
 */
export default function NotePage() {
  const { id: noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Connecting...');
  
  // Refs for persistent values that don't cause re-renders
  const socketRef = useRef(null);
  const debounceTimer = useRef(null);

  // Effect for fetching initial note data and setting up the WebSocket connection
  useEffect(() => {
    // 1. Fetch initial note data via HTTP
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/notes/${noteId}`);
        if (!response.ok) {
          throw new Error('Note not found. The link might be invalid or the note was deleted.');
        }
        const data = await response.json();
        setNote(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();

    // 2. Initialize WebSocket Connection
    socketRef.current = io(API_URL);
    const socket = socketRef.current;

    // --- Socket Event Listeners ---
    socket.on('connect', () => {
      console.log(`✅ [CONNECTED] Socket established with ID: ${socket.id}`);
      setSaveStatus('Connected');
      socket.emit('join_note', noteId);
    });

    socket.on('note_updated', (updatedContent) => {
      console.log("🔄 [RECEIVE] Received 'note_updated' from server!");
      setNote(prev => ({ ...prev, content: updatedContent }));
      setSaveStatus('Saved');
    });

    socket.on('active_users', (count) => {
      console.log(`👨‍👩‍👧‍👦 [USERS] Active users count updated: ${count}`);
      setActiveUsers(count);
    });

    socket.on('note_save_success', () => {
      setSaveStatus('Saved');
    });

    socket.on('disconnect', () => {
      console.log('❌ [DISCONNECTED] Socket connection lost!');
      setSaveStatus('Error'); // Show connection error
    });
    
    // --- Cleanup Logic ---
    // This function runs when the component unmounts (e.g., user navigates away)
    return () => {
      if (socket) {
        console.log('🚪 [LEAVING] Disconnecting socket.');
        socket.disconnect();
      }
    };
  }, [noteId]); // Re-run effect if the noteId in the URL changes

  /**
   * Handles changes in the editor's content.
   * Updates the local state immediately and sends the update to the server
   * after a short delay (debouncing) to avoid excessive network requests.
   */
  const handleContentChange = (newContent) => {
    // Update local UI instantly for a smooth user experience
    setNote(prev => ({ ...prev, content: newContent }));
    setSaveStatus('Unsaved');

    // Clear any existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.caurrent);
    }

    // Set a new timer to send the update after 1 second of inactivity
    debounceTimer.current = setTimeout(() => {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        console.log("✍️ [SEND] Sending 'note_update' to server.");
        socket.emit('note_update', { noteId, content: newContent });
        setSaveStatus('Saved');
      } else {
        console.warn("⚠️ [WARN] Cannot send update, socket is not connected.");
        setSaveStatus('Error');
      }
    }, 1000);
  };
  
  // --- Render Logic ---
  if (loading) {
    return <div className="loading-container">Loading Note Room...</div>; // TODO: Add a cool spinner
  }
  
  if (error) {
    return <div className="error-container">Error: {error}</div>; // TODO: Style this error state
  }

  return (
    <div className="glass-card note-card animate-fade-in">
      <div className="note-header">
        <h2 className="note-title">{note?.title}</h2>
        <div className="note-meta">
          <StatusIndicator status={saveStatus} />
          <ActiveUsers count={activeUsers} />
          <CopyLinkButton />
        </div>
      </div>
      <div className="note-body">
        <Editor 
          content={note?.content || ''} 
          onChange={handleContentChange} 
        />
      </div>
    </div>
  );
}