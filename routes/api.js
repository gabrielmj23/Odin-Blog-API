const express = require('express');
const router = express.Router();
const passport = require('passport');

// Get model controllers
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const commentController = require('../controllers/commentController');

/// ROUTES ///

/* User routes */
// Sign user up
router.post('/signup', userController.signup);

// Log user in
router.post('/login', userController.login);


/* Post routes */
// Get list of posts
router.get('/posts', postController.get_posts);

// Get specific post
router.get('/posts/:postId', postController.get_post);

// Create a new post
router.post('/posts', passport.authenticate('jwt', {session: false}), postController.create_post);

// Update a post
router.put('/posts/:postId', passport.authenticate('jwt', {session: false}), postController.update_post);

// Delete a post
router.delete('/posts/:postId', passport.authenticate('jwt', {session: false}), postController.delete_post);


/* Comment routes */
// Get comments from a post
router.get('/posts/:postId/comments', commentController.get_comments);

// Get specific comment from a post
router.get('/posts/:postId/comments/:commentId', commentController.get_comment);

// Create a new comment
router.post('/posts/:postId/comments', commentController.create_comment);

// Update a comment
router.put('/posts/:postId/comments/:commentId', passport.authenticate('jwt', {session: false}), commentController.update_comment);

// Delete all comments from a post
router.delete('/posts/:postId/comments', passport.authenticate('jwt', {session: false}), commentController.delete_comments);

// Delete specific comment
router.delete('/posts/:postId/comments/:commentId', passport.authenticate('jwt', {session: false}), commentController.delete_comment);


module.exports = router;