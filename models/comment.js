const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CommentSchema = new Schema({
    author: {type: String, minlength: 1, maxlength: 25, required: true},
    content: {type: String, minlength: 1, required: true},
    timestamp: {type: Date, default: Date.now(), required: true}
});

// Export model
module.exports = mongoose.model('Comment', CommentSchema);