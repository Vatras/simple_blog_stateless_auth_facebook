/**
 * Created by Pjesek on 20.07.2016.
 */
var passport = require("passport");
var passportJWT = require("passport-jwt");
var users = require("./users.js");
var cfg = require("./auth_config.js");
// var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
        token = req.cookies.JWT;
    return token;
};
var params = {
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: cookieExtractor
    //jwtFromRequest: ExtractJwt.fromAuthHeader()
};



module.exports = function() {
    var strategy = new Strategy(params, function(payload, done) {
        var user = users[payload.id] || null;
        if (user) {
            return done(null, {id: user.id});
        } else {
            return done(new Error("User not found"), null);
        }
    });
    passport.use(strategy);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", cfg.jwtSession);
        }
    };
};