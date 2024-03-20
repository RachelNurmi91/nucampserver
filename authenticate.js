const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// Since the userSchema has access to the Local plugin and user modal is created with userSchema we already have access to it.
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config.js');

// The authenticate method is provded by passport.
exports.local = passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};
// Specifies how token should be extracted from the req
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassword = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    // The done() method comes from passport jwt
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false)
                }
            })
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});