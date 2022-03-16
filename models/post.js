const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

var PostSchema = new Schema({
    title: {type: String, minlength: 1, maxlength: 50, required: true},
    description: {type: String, minlength: 1, maxlength: 100, required: true},
    body: {type: String, minlength: 1, required: true},
    comments: [ {type: Schema.Types.ObjectId, ref: 'Comment'} ],
    timestamp: {type: Date, default: Date.now(), required: true},
    visible: {type: Boolean, required: true},
    author: {type: String, required: true}
});

// Virtual property for formatted timestamp
PostSchema.virtual('timestamp_formatted').get(function() {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED);
});

// Export model
module.exports = mongoose.model('Post', PostSchema);