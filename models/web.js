const mongoose = require('mongoose')

const Web = mongoose.model('Web', {
    img:
    {
        data: Buffer,
        contentType: String
    },
    name: String,
    likes: Number,
})

module.exports = Web