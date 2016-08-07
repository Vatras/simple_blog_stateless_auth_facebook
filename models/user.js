var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var userSchema = Schema({
    email: String,
    password: String,
    admin: Boolean,
    profile_id : Number
});
var SALT_WORK_FACTOR=10;
userSchema.pre('save', function(next) {
    var user = this;

    if(!user.password)
        next()
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

var userModel = mongoose.model('User',  userSchema);


module.exports = userModel