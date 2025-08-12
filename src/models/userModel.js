const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    phone: {type:String},
})
const User = new mongoose.model('user', userSchema);
module.exports = User;