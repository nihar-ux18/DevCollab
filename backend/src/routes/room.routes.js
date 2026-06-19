const express = require('express');
const router = express.Router();
const {createRoom, joinRoom, getRoom, leaveRoom} = require ('');
const {protect} = require('../middleware/auth.middleware');

router.post('/', protect, createRoom);
router.post('/join/:roomId', protect, joinRoom);
router.get('/:roomId', protect, getRoom);
router.post('/leave/:roomId', protect, leaveRoom);

module.exports = router;