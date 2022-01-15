const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: {
        type : String,
        required : true
    },
    password: {
        type : String,
        required : true
    }
});

const Contact = mongoose.model('Users', schema);
module.exports = Contact;

