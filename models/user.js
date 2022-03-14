const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Simple user schema to save author data
var UserSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true}
});

// Export model
module.exports = mongoose.model('User', UserSchema);