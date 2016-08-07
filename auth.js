/**
 * Created by Pjesek on 20.07.2016.
 */
var passport = require("passport");
var passportJWT = require("passport-jwt");
var cfg = require("./auth_config.js");
var config = require('./config'); // get our config file
var User   = require('./models/user');
var jwt = require("jwt-simple");
var bcrypt = require('bcrypt');
var FacebookStrategy = require('passport-facebook').Strategy;
var Strategy = passportJWT.Strategy;

passport.serializeUser(function(user, done) {
    // placeholder for custom user serialization
    // null is for errors
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // placeholder for custom user deserialization.
    // maybe you are going to get the user from mongo by id?
    // null is for errors
    done(null, user);
});

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
        token = req.cookies.JWT;
    return token;
};
var params = {
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: cookieExtractor
};
//to use maybe in future
function parseToken(req, res,next) {
    if(req.cookies && req.cookies.JWT)
    {
        var token = req.cookies.JWT
        req.decodedToken=jwt.decode(token, cfg.jwtSecret);
    }
    next();
}
var comparePassword = function(password, userPassword, callback) {
    bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
        if (err)
            return callback(err);
        return callback(null, isPasswordMatch);
    });
};
function createToken(req, res) {
    if (req.body.email && req.body.password) {
        var email = req.body.email||"";
        var password = req.body.password||"";

                User.findOne({'email':email},function(err,result){
                    if (result) {
                        comparePassword(password,result.password,function(err,passwordMatch){
                            if(passwordMatch)
                            {
                                var payload = {id: result.id,date: new Date().getTime()};
                                var token = jwt.encode(payload, cfg.jwtSecret)
                                res.cookie('JWT',token, { maxAge: 900000, httpOnly: true });
                                res.redirect("/customLogin");
                            }else {
                                res.redirect("/error/Passwords do not match") //TODO: change method of showing error reasons in future
                            }
                        })

                    } else {
                            res.redirect("/error")
                    }
                })
    }
    else {
        res.redirect("/error")
    }
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        // req.user is available for use here
        return next(); }

    // denied. redirect to login
    res.redirect('/login')
}
module.exports = function() {
    var strategy = new Strategy(params, function(payload, done) {
        User.findOne({_id:payload.id},function(err,user){
        if (user) {
            return done(null, {id: user.id});
        } else {
            return done(new Error("User not found"), null);
        }})
    });

    passport.use(strategy);
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, cb) {
            User.findOne({'profile_id' : profile.id},function(err,result){
                if(!result){
                    var newUser=User({
                        profile_id:profile.id
                    });
                        newUser.save(function(err){
                            if (err) throw err;
                        })
                }else{
                    cb(err,result);
                }
            });
        }
    ));

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticateCustom: function() {
            //return passport.authenticate("facebook", { failureRedirect: '/error' });
            return passport.authenticate("jwt", cfg.jwtSession);
        },
        authenticateFacebook: function() {
            return passport.authenticate("facebook", { successRedirect: '/',failureRedirect: '/error/Couldnt_authenticate' });
        },
        createToken: createToken,
        ensureAuthenticated: ensureAuthenticated,
        passport: passport
    };
};