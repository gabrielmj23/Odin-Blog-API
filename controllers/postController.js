const Post = require('../models/post');
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
            return res.status(400).json({post, errors: errors.array()});
        }

        // Save valid post
        post.save(function(err) {
            if (err) { return next(err); }
            res.status(200).json({post, message: 'Post saved successfully.'});
        });
    }
];

// TODO
// Update a post 
exports.update_post = function(req, res, next) {
    res.send('Hi');
};

// Delete a post
exports.delete_post = function(req, res, next) {
    res.send('Hi');
};