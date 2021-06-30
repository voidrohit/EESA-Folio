var mongoose = require('mongoose');

var Post = new mongoose.model('Post', {
    username: String,
    heading: String,
    about: String,
})

module.exports = Post;