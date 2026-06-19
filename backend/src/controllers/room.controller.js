const Room = require('../models/Room.model');
const User = require('../models/User.model');
const createRoom = async (req, res) => {
    try {
        const { name, language } = req.body;
        const userId = req.user._id;
        let roomId = Room.generateRoomId();
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            const existingRoom = await Room.findOne({ roomId });
            if (!existingRoom) {
                isUnique = true;
            } else {
                roomId = Room.generateRoomId();
                attempts++;
            }
        }
        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate unique room ID'
            });
        }
        const room = await Room.create({
            roomId,
            name: name || `Room-${roomId}`,
            host: userId,
            participants: [userId],
            language: language || 'javascript'
        });
        await User.findByIdAndUpdate(userId, { currentRoom: roomId });
        res.status(201).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Create Room Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findOne({ roomId, isActive: true });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found or inactive'
            });
        }
        if (room.participants.length >= room.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Room is full'
            });
        }
        if (!room.participants.includes(userId)) {
            room.participants.push(userId);
            await room.save();
        }
        await User.findByIdAndUpdate(userId, { currentRoom: roomId });
        await room.populate('participants', 'username email isOnline');
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Join Room Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ roomId, isActive: true })
            .populate('host', 'username email')
            .populate('participants', 'username email isOnline');
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Get Room Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }
        room.participants = room.participants.filter(
            participant => participant.toString() !== userId.toString()
        );
        if (room.participants.length === 0) {
            room.isActive = false;
        }
        await room.save();
        await User.findByIdAndUpdate(userId, { currentRoom: null });
        res.status(200).json({
            success: true,
            message: 'Successfully left the room'
        });
    } catch (error) {
        console.error('Leave Room Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
module.exports = { createRoom, joinRoom, getRoom, leaveRoom };