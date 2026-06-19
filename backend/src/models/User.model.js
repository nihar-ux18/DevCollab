const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    currentRoom: {
        type: String,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function () {
    const user = this;

    // Only hash if password is modified
    if (!user.isModified('password')) {
        return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);