const mongoose = require('mongoose');
const bycrypt = require('bycryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type:String,
        require: true,
        unique: true,
        trim: true,
        minlength: 3
    },email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/]
    },password:{
        type:String,
        require: true,
        unique:true,
        minlength:8,
        select: false
    },currentRoom:{
        type: String,
        default: null
    },isOnline:{
        type:Boolean,
        default: false
    }
},{
        timestamps: true
});

UserSchema.pre('save',async function (next) {
    if(!this.isModified('password')){
        return next();
    }

    const salt = await bycrypt.genSalt(10);
    this.password = await bycrypt.hash(candidatePassword, this.password); 
});

module.exports = mongoose.model('User', UserSchema);