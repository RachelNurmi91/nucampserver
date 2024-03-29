const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const router = express.Router();

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
  .then(users => res.status(200).json(users))
  .catch(err => next(err))

});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({username: req.body.username}),
    req.body.password,
   (err, user) => {
      if (err) {
        // This errors is for is there is a interal server error. Not user error.
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save(err => {
          if (err) {
            res.statusCode = 500;
            res.setHeader = ('Content-Type', 'application/json');
            res.jsom({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({succes: true, status: 'Registration Succesful!'});
          })
        })

      }
    }
  )
});

router.post('/login' ,cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  // We get the token from the getToken method in authenticate.js
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are succcessfully logged in!'})
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
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

router.get('/facebook.token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({succes: true, token: token, status: 'You are successfully logged in.'})
  }
})

module.exports = router;
