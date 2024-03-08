const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true
    }
})

module.exports  = new mongoose.model('user', UserSchema);