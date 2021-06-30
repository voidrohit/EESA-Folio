var mongoose = require('mongoose');
 
var imageSchema = new mongoose.Schema({
    username: String,
    subject: String,
    name: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});

module.exports = new mongoose.model('Image', imageSchema);