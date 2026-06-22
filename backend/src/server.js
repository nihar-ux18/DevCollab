const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5000'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
  
  app.use(express.static(frontendBuildPath));
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'DevCollab API Server',
      docs: 'Visit /api/health for status',
      environment: 'development'
    });
  });
}

const users = {};
const chatHistory = {};

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, username }) => {
    const previousRoom = users[socket.id]?.roomId;
    if (previousRoom && previousRoom !== roomId) {
      socket.leave(previousRoom);
    }

    socket.join(roomId);
    users[socket.id] = { username, roomId };
    
    console.log(`👤 ${username} joined room: ${roomId}`);
    
    socket.to(roomId).emit('user-joined', { 
      username, 
      message: `${username} has joined the room!` 
    });
    
    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    const participants = [];
    if (roomSockets) {
      roomSockets.forEach((socketId) => {
        if (users[socketId]) {
          participants.push(users[socketId].username);
        }
      });
    }
    socket.emit('room-participants', { participants });
    io.to(roomId).emit('participants-update', { participants });

    if (chatHistory[roomId]) {
      socket.emit('previous-messages', chatHistory[roomId]);
    }
  });

  socket.on('code-change', ({ roomId, code }) => {
    const username = users[socket.id]?.username || 'Anonymous';
    socket.to(roomId).emit('code-update', { 
      code, 
      from: username 
    });
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    const username = users[socket.id]?.username;
    if (username) {
      socket.to(roomId).emit('user-typing', { 
        username,
        isTyping 
      });
    }
  });

  socket.on('signal', ({ roomId, signalData, targetUsername, fromUsername }) => {
    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    if (roomSockets) {
      roomSockets.forEach((socketId) => {
        if (users[socketId]?.username === targetUsername) {
          io.to(socketId).emit('signal', { signalData, fromUsername });
        }
      });
    }
  });

  socket.on('chat-message', ({ roomId, username, message, timestamp }) => {
    const messageData = { username, message, timestamp };
    
    if (!chatHistory[roomId]) {
      chatHistory[roomId] = [];
    }
    chatHistory[roomId].push(messageData);
    if (chatHistory[roomId].length > 100) {
      chatHistory[roomId] = chatHistory[roomId].slice(-100);
    }
    
    io.to(roomId).emit('chat-message', messageData);
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username, roomId } = users[socket.id];
      console.log(`${username} disconnected from ${roomId}`);
      
      socket.to(roomId).emit('user-left', { 
        username, 
        message: `${username} has left the room.` 
      });
      
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      const participants = [];
      if (roomSockets) {
        roomSockets.forEach((socketId) => {
          if (users[socketId]) {
            participants.push(users[socketId].username);
          }
        });
      }
      io.to(roomId).emit('participants-update', { participants });
      
      delete users[socket.id];
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});