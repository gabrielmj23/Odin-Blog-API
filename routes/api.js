const express = require('express');
const router = express.Router();
require('dotenv').config();
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

/* Test routes */
router.get('/test', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.send('Success');
});

module.exports = router;