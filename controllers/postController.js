const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');

// Get all posts
exports.get_posts = function(req, res, next) {
    Post.find({}).
      sort({timestamp: -1}).
      exec(function(err, results) {
        if (err) { return next(err); }
        // No posts were found
        if (results.length < 1) {
            return res.status(404).json({message: 'No posts found.'});
        }
        // Return list of posts
        res.status(200).json({posts: results});
      });
};

// Get one post
exports.get_post = function(req, res, next) {
    Post.findById(req.params.postId).
      populate('comments'). 
      exec(function(err, result) {
          if (err) { return next(err); }
          // Post wasn't found
          if (!result) {
              return res.status(404).json({message: 'Error: This post does not exist.'});
          }
          // Return post
          res.status(200).json({post: result});
      });
};

// Add a new post
exports.create_post = [
    // Validate and sanitize input
    body('title', 'Title must be between 1 and 50 characters.').trim().isLength({min: 1, max: 50}).escape(),
    body('description', 'Description must be between 1 and 100 characters.').trim().isLength({min: 1, max: 100}).escape(),
    body('body', 'Post body cannot be empty.').trim().isLength({min: 1}).escape(),
    body('visible', 'Post visibility should be true or false.').isBoolean(),
    body('author', 'Author username is required.').trim().isLength({min: 1}).escape(),

    // Process request
    (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Create new post
        var post = new Post({
            title: req.body.title,
            description: req.body.description,
            body: req.body.body,
            comments: [],
            timestamp: Date.now(),
            visible: req.body.visible,
            author: req.body.author
        });

        if (!errors.isEmpty()) {
            // Send back post with error messages
            return res.status(400).json({errors: errors.array(), post});
        }

        // Save valid post
        post.save(function(err) {
            if (err) { return next(err); }
            res.status(200).json({post, message: 'Post saved successfully.'});
        });
    }
];

// Update a post 
exports.update_post = [
    // Validate and sanitize input
    body('title', 'Title must be between 1 and 50 characters.').trim().isLength({min: 1, max: 50}).escape(),
    body('description', 'Description must be between 1 and 100 characters.').trim().isLength({min: 1, max: 100}).escape(),
    body('body', 'Post body cannot be empty.').trim().isLength({min: 1}).escape(),
    body('visible', 'Post visibility should be true or false.').isBoolean(),
    body('author', 'Author username is required.').trim().isLength({min: 1}).escape(),

    // Process request
    async (req, res, next) => {
        // Extract validation errors
        const errors = validationResult(req);

        // Get post's comments through id
        var postComments = await Post.findById(req.params.postId, 'comments');
        if (!postComments) {
            // Post id is not valid
            return res.status(404).json({message: 'This post was not found.'});
        }

        // Create updated post
        var post = new Post({
            title: req.body.title,
            description: req.body.description,
            body: req.body.body,
            comments: postComments,
            visible: req.body.visible,
            author: req.body.author,
            _id: req.params.postId
        });

        if (!errors.isEmpty()) {
            // Send back post with error messages
            res.status(400).json({post, errors: errors.array()});
        }

        // All correct, update post
        Post.findByIdAndUpdate(req.params.postId, post, {}, function(err, newPost) {
            if (err) { return next(err); }
            // Send success message along with updated post
            res.status(200).json({post, message: 'Post updated successfully.'});
        });
    }
];

// Delete a post
exports.delete_post = async function(req, res, next) {
    // Get post from id
    var post = await Post.findById(req.params.postId);
    if (!post) {
        // Post id is not valid
        res.status(404).json({message: 'This post was not found.'});
    }

    // Delete every comment from this post
    post.comments.forEach(commentId => {
        Comment.findByIdAndRemove(commentId, function(err) {
            if (err) { return next(err); }
        });
    });

    // Delete the post
    Post.findByIdAndRemove(req.params.postId, function(err) {
        if (err) { return next(err); }
        // Send success message
        res.status(200).json({message: 'Post deleted successfully.'});
    });
};