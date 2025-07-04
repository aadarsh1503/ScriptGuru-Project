const Note = require('../models/Note');

// A helper function to avoid repeating code (DRY principle)
const broadcastUserCount = async (io, noteId) => {
    // Await this to make sure we get the clients
    const clients = await io.in(noteId).allSockets();
    // *** FIX #1: Send the NUMBER directly, NOT an object. ***
    io.to(noteId).emit('active_users', clients.size);
    console.log(`Broadcasted user count: ${clients.size} to room ${noteId}`);
};

module.exports = (socket, io) => {
    console.log('New client connected:', socket.id);

    // Join a note room
    // Note: The client sends the noteId string directly.
    socket.on('join_note', (noteId) => {
        socket.join(noteId);
        console.log(`User ${socket.id} joined note ${noteId}`);
        // After a user joins, update the count for everyone in that room.
        broadcastUserCount(io, noteId);
    });

    // Handle note updates
    socket.on('note_update', async ({ noteId, content }) => {
        try {
            // *** FIX #3 (Quality): Let Mongoose handle `updatedAt` via `timestamps:true`. ***
            const updatedNote = await Note.findByIdAndUpdate(
                noteId,
                { content },
                { new: true }
            );

            if (updatedNote) {
                // *** FIX #2: Send only the content STRING, as the frontend expects. ***
                socket.to(noteId).emit('note_updated', updatedNote.content);
            }
        } catch (err) {
            console.error('Error updating note:', err);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Find which room the socket was in from the `socket.rooms` set
        const rooms = Array.from(socket.rooms);
        const noteRoom = rooms.find(room => room !== socket.id); // The room that is not the default self-room

        if (noteRoom) {
            // After the user disconnects, broadcast the new, lower count to the room they left.
            broadcastUserCount(io, noteRoom);
        }
    });
};