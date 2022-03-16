const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

var CommentSchema = new Schema({
    author: {type: String, minlength: 1, maxlength: 25, required: true},
    content: {type: String, minlength: 1, required: true},
    timestamp: {type: Date, default: Date.now(), required: true}
});

// Virtual property for formatted timestamp
CommentSchema.virtual('timestamp_formatted').get(function() {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED);
});

// Export model
module.exports = mongoose.model('Comment', CommentSchema);