const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');

// Initialize
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== DATABASE CONNECTION ==========
connectDB();

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Test Route
app.get('/api/health', (req, res) => {
    res.json({
        status: '✅ Server is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// ========== SOCKET.IO LOGIC ==========
const users = {};

io.on('connection', (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, username }) => {
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
    });

    socket.on('code-change', ({ roomId, code }) => {
        socket.to(roomId).emit('code-update', {
            code,
            from: users[socket.id]?.username || 'Anonymous'
        });
    });

    socket.on('typing', ({ roomId, isTyping }) => {
        socket.to(roomId).emit('user-typing', {
            username: users[socket.id]?.username,
            isTyping
        });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            const { username, roomId } = users[socket.id];
            console.log(`🔴 ${username} disconnected from ${roomId}`);
            socket.to(roomId).emit('user-left', {
                username,
                message: `${username} has left the room.`
            });
            delete users[socket.id];
        }
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io server is ready`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});