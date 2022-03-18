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
    if (post.comments.indexOf(req.params.commentId) < 0) {
        return res.status(400).json({message: 'This comment does not belong to this post.'});
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
            Post.findByIdAndUpdate(req.params.postId, {'comments': newComments}, {}, function(err) {
                if (err) { return next(err); }
                // Return comment with success message
                res.status(200).json({comment, message: 'Comment added successfully.'});
            });
        });
    }
];

// Update a comment
exports.update_comment = [
    // Validate and sanitize input
    body('author', 'Comment author name must be between 1 and 25 characters.').trim().isLength({min: 1, max: 25}).escape(),
    body('content', 'Comment content must not be empty.').trim().isLength({min: 1}).escape(),

    // Process request
    async (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Check if post and comment exist
        var post = await Post.findById(req.params.postId);
        var originalComment = await Comment.findById(req.params.commentId);

        if (!post) {
            return res.status(404).json({message: 'Post was not found.'});
        }
        if (!originalComment) {
            return res.status(404).json({message: 'Comment was not found.'});
        }
        if (post.comments.indexOf(req.params.commentId) < 0) {
            return res.status(400).json({message: 'This comment does not belong to this post.'});
        }

        // Create new comment for updating
        var comment = new Comment({
            author: req.body.author,
            content: req.body.content,
            timestamp: originalComment.timestamp,
            _id: req.params.commentId
        });

        if (!errors.isEmpty()) {
            // Return updated comment with error messages
            return res.status(400).json({errors: errors.array(), comment});
        }

        // Update comment
        Comment.findByIdAndUpdate(req.params.commentId, comment, {new: true}, function(err, newComment) {
            if (err) { return next(err); }
            res.status(200).json({comment: newComment, message: 'Comment updated successfully'});
        });
    }
];

// Delete all comments from a post
exports.delete_comments = async function(req, res, next) {
    // Get post comments from id
    var post = await Post.findById(req.params.postId, 'comments');
    if (!post) {
        // Incorrect post id
        res.status(404).json({message: 'Post was not found.'});
    }

    // Go through comments array and delete each document
    post.comments.forEach(commentId => {
        Comment.findByIdAndRemove(commentId, function(err) {
            if (err) { return next(err); }
        });
    });

    // Update post with empty comments array
    Post.findByIdAndUpdate(req.params.postId, {'comments': []}, {new: true}, function(err, newPost) {
        if (err) { return next(err); }
        res.status(200).json({post: newPost, message: 'Successfully deleted all comments from this post.'});
    });
};

// Delete one comment
exports.delete_comment = async function(req, res, next) {
    // Get post and comment from id
    var post = await Post.findById(req.params.postId, 'comments');
    var comment = await Comment.findById(req.params.commentId);

    if (!post) {
        return res.status(404).json({message: 'Post was not found.'});
    }
    if (!comment) {
        return res.status(404).json({message: 'Comment was not found.'});
    }

    // Find comment in post's comments
    var index = post.comments.indexOf(req.params.commentId);
    if (index < 0) {
        // Comment doesn't belong to this post
        return res.status(400).json({message: 'This comment does not belong to this post.'});
    }

    // Delete comment id from array
    var newComments = post.comments;
    newComments.splice(index, 1);

    // Delete comment from db
    Comment.findByIdAndRemove(req.params.commentId, function(err) {
        if (err) { return next(err); }
    });

    // Update post's list of comments
    Post.findByIdAndUpdate(req.params.postId, {'comments': newComments}, {new: true}, function(err, newPost) {
        if (err) { return next(err); }
        res.status(200).json({post: newPost, message: 'Successfully deleted comment from post.'});
    });
};