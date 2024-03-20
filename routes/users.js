const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(
    new User({username: req.body.username}),
    req.body.password,
    err => {
      if (err) {
        // This erros is for is there is a interal server error. Not user error.
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({succes: true, status: 'Registration Succesful!'});
        })
      }
    }
  )
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  // We get the token from the getToken method in authenticate.js
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are succcessfully logged in!'})
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
})

module.exports = router;
