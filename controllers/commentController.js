const Comment = require('../models/comment');
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');

// Get all comments from a post
exports.get_comments = async function(req, res, next) {
    var comments = await Post.findById(req.params.postId, 'comments');
    if (!comments) {
        // Invalid post id
        return res.status(404).json({message: 'Post was not found.'});
    }

    // Return list of comments
    res.status(200).json({comments});
};

// Get one comment
exports.get_comment = async function(req, res, next) {
    // Find post comments and individual comment from ids
    var post = await Post.findById(req.params.postId, 'comments');
    var comment = await Comment.findById(req.params.commentId);

    // Check for invalid postId or commentId
    if (!post) {
        return res.status(404).json({message: 'Post was not found.'});
    }
    if (!comment) {
        return res.status(404).json({message: 'Comment was not found.'});
    }

    // Return comment successfully
    res.status(200).json({comment});
};

// Add a comment
exports.create_comment = [
    // Validate and sanitize input
    body('author', 'Comment author name must be between 1 and 25 characters.').trim().isLength({min: 1, max: 25}).escape(),
    body('content', 'Comment content must not be empty.').trim().isLength({min: 1}).escape(),

    // Process request
    async (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create new comment
        var comment = new Comment({
            author: req.body.author,
            content: req.body.content,
            timestamp: Date.now()
        });

        // Get post from id
        var post = await Post.findById(req.params.postId);
        if (!post) {
            // Post doesn't exist
            return res.status(404).json({message: 'Post was not found.'});
        }

        if (!errors.isEmpty()) {
            // Return comment with error messages
            return res.status(400).json({errors: errors.array(), comment});
        }

        // Save comment to db
        comment.save(function(err, comment) {
            if (err) { return next(err); }

            // Add new comment to post
            var newComments = post.comments;
            newComments.push(comment._id);

            // Update post
            Post.findByIdAndUpdate(req.params.postId, {'comments': newComments}, function(err, newPost) {
                if (err) { return next(err); }
                // Return comment with success message
                res.status(200).json({comment, message: 'Comment added successfully.'});
            });
        });
    }
];

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