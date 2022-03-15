const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const User = require('./models/user');
require('dotenv').config();

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, cb) {
    User.findOne({username: username}, (err, user) => {
      if (err) {
        // There was an error with the query
        return cb(err);
      }
      if (!user) {
        // User was not found
        return cb(null, false, 'Wrong username or password.');
      }

      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // Password is correct
          return cb(null, user.toJSON());
        }
        // Wrong password
        return cb(null, false, 'Wrong username or password.');
      });
    });
  })
);

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET_KEY
    },
    function(payload, cb) {
        return cb(null, payload);
    })
);