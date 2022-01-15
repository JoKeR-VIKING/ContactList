const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    contactInfo: {
        type: Array,
        required: true
    }
});

const Contact = mongoose.model('Contact', schema);
module.exports = Contact;
