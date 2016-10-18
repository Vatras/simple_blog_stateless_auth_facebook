var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Post', new Schema({
    title: String,
    text: String,
    date: Number,
    version: Number,
    comments: [{
        author: String,
        text: String
    }]
}));