import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '../components/Editor';
import ActiveUsers from '../components/ActiveUsers';
import CopyLinkButton from '../components/CopyLinkButton';


const API_URL = import.meta.env.VITE_API_URL || 'https://scriptguru-project.onrender.com/';


const StatusIndicator = ({ status }) => {

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


export default function NotePage() {
  const { id: noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Connecting...');
  
  const socketRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
 
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

   
    socketRef.current = io(API_URL);
    const socket = socketRef.current;

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
      setSaveStatus('Error');
    });
    
    return () => {
      if (socket) {
        console.log('🚪 [LEAVING] Disconnecting socket.');
        socket.disconnect();
      }
    };
  }, [noteId]);

  const handleContentChange = (newContent) => {
    setNote(prev => ({ ...prev, content: newContent }));
    setSaveStatus('Unsaved');

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        console.log("✍️ [SEND] Sending 'note_update' to server.");
        socket.emit('note_update', { noteId, content: newContent });
        setSaveStatus('Saving...'); // Set to 'Saving...' right before emit
      } else {
        console.warn("⚠️ [WARN] Cannot send update, socket is not connected.");
        setSaveStatus('Error');
      }
    }, 1000);
  };
  
  if (loading) {
    return <div className="loading-container">Loading Note Room...</div>;
  }
  
  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }


  return (

    <div className="glass-card note-card animate-fade-in p-4 md:p-6">

      <div className="note-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
      
        <h2 className="note-title text-2xl md:text-3xl font-bold">{note?.title}</h2>

        <div className="note-meta flex items-center flex-wrap gap-x-4 gap-y-2">
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