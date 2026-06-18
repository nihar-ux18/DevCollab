const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"]
    }
});


app.use(cors());
app.use(express.json()); 

connectDB();

app.get('/api/health', (req, res) => { res.json({ status: "Server is running" });
});


const users = {};

io.on('connection', (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, username }) => { socket.join(roomId);
        users[socket.id] = { username, roomId };
        console.log(`👤 ${username} joined room: ${roomId}`);

        socket.to(roomId).emit('user-joined', { username, message: `${username} has joined the room.`});

        const roomSockets = io.sockets.adapter.rooms.get(roomId);
        const participants = [];
        if (roomSockets) {
            roomSockets.forEach((socketId) => { if (users[socketId]) {
                    participants.push(users[socketId].username);
                }
            });
        }
        socket.emit('room-participants', { participants });
    });


    socket.on('code-change', ({ roomId, code }) => {
        socket.to(roomId).emit('code-update', { code, from: users[socket.id]?.username || 'Anonymous'});
    });


    socket.on('typing', ({ roomId, isTyping }) => {
        socket.to(roomId).emit('user-typing', { username: users[socket.id]?.username, isTyping});
    });

    socket.on('disconnect', () => { if (users[socket.id]) {
            const { username, roomId } = users[socket.id];
            console.log(`🔴 ${username} disconnected from ${roomId}`);
            socket.to(roomId).emit('user-left', { username, message: `${username} has left the room`});
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`);
});