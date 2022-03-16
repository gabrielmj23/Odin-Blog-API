const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');

// TODO
// Get all comments from a post
exports.get_comments = function(req, res, next) {
    res.send('Hi');
};

// Get one comment
exports.get_comment = function(req, res, next) {
    res.send('Hi');
};

// Add a comment
exports.create_comment = function(req, res, next) {
    res.send('Hi');
};

// Update a comment
exports.update_comment = function(req, res, next) {
    res.send('Hi');
};

// Delete all comments from a post
exports.delete_comments = function(req, res, next) {
    res.send('Hi');
};

// Delete one comment
exports.delete_comment = function(req, res, next) {
    res.send('Hi');
};