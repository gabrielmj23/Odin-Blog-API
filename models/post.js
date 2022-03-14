const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: {type: String, minlength: 1, required: true},
    description: {type: String, minlength: 1, maxlength: 75, required: true},
    body: {type: String, minlength: 1, required: true},
    comments: [ {type: Schema.Types.ObjectId, ref: 'Comment'} ],
    timestamp: {type: Date, default: Date.now(), required: true},
    visible: {type: Boolean, required: true}
    // Would specify author if there was more than one
});

// Export model
module.exports = mongoose.model('Post', PostSchema);