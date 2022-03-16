const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.signup = [
    // Validate username
    body('username').trim().
      isLength({min: 1}).withMessage('Username cannot be empty.').
      isAlphanumeric('es-ES', {ignore: ' -_'}).withMessage('Username can contain letters, numbers, spaces, hyphens and underscores.').
      escape().
      custom(async (username) => {
          try {
              // Check if username is in use
              var taken = await User.findOne({username: username});
              if (taken !== null) {
                  throw new Error('Username is not available.');
              }
              return true;
          } catch(err) {
              throw new Error(err);
          }
      }),

    // Validate password
    body('password').trim().
      isLength({min: 8}).withMessage('Password must have at least 8 characters.').
      escape().
      custom(password => {
          // Create password regular expression
          var pattern = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@!%\*#\?])(?=.{8,})');
          if (!pattern.test(password)) {
            throw new Error('Password doesn\'t meet requirements: at least one lowercase letter, one uppercase letter, a number and a especial character ($, @, !, %, *, # or ?).')
          }
          return true;
      }),

      // Process request
      (req, res, next) => {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              // Return response with error messages
              res.status(400).json({
                  message: `Couldn't create user.`,
                  errors: errors.array()
              });
              return;
          }

          // Create new user with hashed password
          bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) { return next(err); }
              var user = new User({
                  username: req.body.username,
                  password: hash
              });
              // Save user to db
              user.save(err => {
                  if (err) { return next(err); }
                  res.status(200).json({
                      message: 'Signed up successfully',
                      user
                  });
              });
          });
      }
];

exports.login = function(req, res, next) {
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
            var token = jwt.sign(user, process.env.SECRET_KEY, {expiresIn: '6h'});
            return res.json({user, token});
        });
    })(req, res);
};
