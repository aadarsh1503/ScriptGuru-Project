const Note = require('../models/Note');


const broadcastUserCount = async (io, noteId) => {
   
    const clients = await io.in(noteId).allSockets();
    
    io.to(noteId).emit('active_users', clients.size);
    
};

module.exports = (socket, io) => {
  


    socket.on('join_note', (noteId) => {
        socket.join(noteId);
       
       
        broadcastUserCount(io, noteId);
    });

    // Handle note updates
    socket.on('note_update', async ({ noteId, content }) => {
        try {
           
            const updatedNote = await Note.findByIdAndUpdate(
                noteId,
                { content },
                { new: true }
            );

            if (updatedNote) {
              
                socket.to(noteId).emit('note_updated', updatedNote.content);
            }
        } catch (err) {
        
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
     
     
        const rooms = Array.from(socket.rooms);
        const noteRoom = rooms.find(room => room !== socket.id); 

        if (noteRoom) {
           
            broadcastUserCount(io, noteRoom);
        }
    });
};