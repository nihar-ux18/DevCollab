const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        require: true,
        unique: true,
        trim: true
    }, name: {
        type: String,
        require: true,
        trim: true,
        maxlength: 50
    }, host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    }, participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }], code: {
        type: String,
        default: '// Welcome to DevCollab!\n//'
    }, language: {
        type: String,
        default: 'python',
        enum: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'c']
    }, isActive: {
        type: Boolean,
        default: true
    }, maxParticipants: {
        type: Number,
        default: 10
    }
},{
    timestamps:true
});

RoomSchema.statics.generateRoomId = function(){
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return result;
};

module.exports = mongoose.model('Room', RoomSchema);