var mongoose = require('mongoose');

var About = new mongoose.model('About', {
    username: String,
    text: {
        type: String,
        default: "Write about yourself here"
    },
    skills: String,
    linkedin: {
        type: String,
        default: null,
    },
    github: {
        type: String,
        default: null,
    },
    whattsapp: {
        type: Number,
        default: null,
    },
    email: {
        type: String,
        default: null,
    }
})

module.exports = About;