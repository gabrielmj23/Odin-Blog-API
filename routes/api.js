const express = require('express');
const router = express.Router();
require('dotenv').config();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Get model controllers
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const commentController = require('../controllers/commentController');

// For user creation
const User = require('../models/user');
const bcrypt = require('bcryptjs');

/// ROUTES ///

/* Authentication routes */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            // Couldn't authenticate
            return res.status(400).json({
                message: 'Something went wrong (there was an error or you used incorrect credentials)',
                user: user
            });
        }

        // Log user in
        req.login(user, {session: false}, (err) => {
            if (err) { res.send(err); }
            
            // Generate json web token and return with response
            var token = jwt.sign(user, process.env.SECRET_KEY, {expiresIn: '1d'});
            return res.json({user, token});
        });
    })(req, res);
});

/* Test routes */

router.get('/test', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.send('Success');
});

module.exports = router;