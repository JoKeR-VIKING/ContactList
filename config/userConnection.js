const contactConnection = require('mongoose');
require('dotenv').config();

contactConnection.connect("mongodb://localhost/contacts");
const db = contactConnection.connection;
db.on('error', console.error.bind(console, 'Connection Error!'));

db.once('open', function () {
    console.log("User Connection Successful");
});
