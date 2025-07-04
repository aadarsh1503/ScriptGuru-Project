const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const noteRoutes = require('./routes/noteRoutes');
const socketController = require('./controllers/socketController');

require('dotenv').config();

const app = express();
const server = http.createServer(app);


const corsOptions = {

  origin: process.env.FRONTEND_URL, 
  

  methods: ['GET', 'POST', 'DELETE'] 
};





app.use(cors(corsOptions)); 

app.use(express.json());



const io = socketio(server, {
  cors: corsOptions
});


// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// --- ROUTES ---
app.use('/api/notes', noteRoutes);


// --- SOCKET.IO CONNECTION HANDLER ---
io.on('connection', (socket) => socketController(socket, io));


app.get("/", (req, res) => res.send("Server is running successfully."));


// --- START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));