const contactConnection = require('mongoose');

// contactConnection.connect("mongodb://localhost/contacts");
contactConnection.connect("mongodb+srv://prathamvasani1:#2002Remix19pratham@cluster0.ckr5c.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
const db = contactConnection.connection;
db.on('error', console.error.bind(console, 'Connection Error!'));

db.once('open', function () {
    console.log("Contact Connection Successful");
});