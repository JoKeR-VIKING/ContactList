const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require('bcrypt');
require('./config/contactConnection');
require('./config/userConnection');
require('dotenv').config();
const Contact = require('./models/contacts');
const Users = require('./models/users');
const port = 8000 || process.env.PORT;
const app = express();
let i = 0;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use(express.urlencoded({extended : true}));
app.use(session({
    secret: "AzBoOFwGxqCMP1rw",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.get('', function (req, res) {
    if (req.session.email)
        return res.redirect('/home');

    return res.render('signUp', {
        title : "Sign Up",
    });
});

app.get('/home', function (req, res) {
    if (!req.session.email)
        return res.redirect('/logIn');

    Contact.find({email: req.session.email}, function (err, contactList) {
        if (err)
        {
            console.log("Cannot fetch contacts!");
            return;
        }

        return res.render('index', {
            title : "Home",
            contact_list : contactList[0] ? contactList[0].contactInfo : [],
            i : i
        });
    });
});

app.get('/logIn', function (req, res) {
    return res.render('logIn', {
        title : "Log In",
    });
});

app.get('/signUp', function (req, res) {
    return res.render('signUp', {
        title : "Sign Up",
    });
});

app.post('/newUser', async function (req, res) {

    try
    {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        Users.find({email: req.body.email}, function (err, userList) {
            if (err)
            {
                console.log("Cannot fetch users!");
                return;
            }
            if (userList.length === 1)
            {
                req.flash('newEmailMsg', 'Email already exists!');
                return res.redirect('back');
            }

            Users.create({
                email: req.body.email,
                password : hashedPassword
            },function (err, newUser)
            {
                if (err)
                {
                    console.log("Error in user creation!");
                }
            });

            return res.redirect('/logIn');
        });
    }
    catch
    {
        return res.redirect('/signUp');
    }
});

app.post('/oldUser', async function (req, res) {
    try
    {
        Users.find({email: req.body.email}, async function (err, user)
        {
            if (err)
            {
                console.log("Cannot fetch user!");
                return;
            }
            if (user.length === 0)
            {
                req.flash('noUser', 'Email does not exist');
                return res.redirect('/logIn');
            }

            try
            {
                await bcrypt.compare(req.body.password, user[0].password, function (err, result) {
                    if (err)
                    {
                        console.log("Error in comparing passwords");
                        return res.redirect('/login');
                    }
                    if (!result)
                    {
                        req.flash('noUser', 'Password incorrect');
                        return res.redirect('/logIn');
                    }

                    req.session.email = req.body.email;
                    return res.redirect('/home');
                });
            }
            catch
            {
                return res.redirect('/logIn');
            }
        });
    }
    catch
    {
        return res.redirect('/logIn');
    }
});

app.post('/addContact', function (req, res) {
    Contact.find({email: req.session.email}, function (err, emailList) {
        if (err)
        {
            console.log("Cannot fetch contacts!");
            return;
        }

        let newContact = {
            name: req.body.name,
            number: req.body.number
        };

        if (emailList.length === 0)
        {
            Contact.create({
                email: req.session.email,
                contactInfo: []
            }, function (err, user) {
                if (err)
                {
                    console.log("Error in creating user");
                    return;
                }

                let contactInfo = user.contactInfo;
                contactInfo.push(newContact);

                Contact.findOneAndUpdate({email: req.session.email}, { $set : {
                    contactInfo: contactInfo
                }}, {
                    new : true
                }, function (err, user) {
                    if (err)
                    {
                        console.log("Error updating user");
                        return;
                    }

                    return res.redirect('back');
                });
            });
        }
        else
        {
            let contactInfo = emailList[0].contactInfo;

            if (!contactInfo.find(contact => contact.number === newContact.number))
            {
                contactInfo.push(newContact);
                Contact.findOneAndUpdate({email: req.session.email}, {
                    $set: {
                        contactInfo: contactInfo
                    }
                }, {
                    new: true
                }, function (err, user)
                {
                    if (err)
                    {
                        console.log("Error updating user");
                        return;
                    }

                    req.flash('successMessage', 'Contact created');
                    return res.redirect('back');
                });
            }
            else
            {
                req.flash('contactExists', 'Contact already exists');
                return res.redirect('back');
            }
        }
    });
});

app.post('/changePage/:id', function (req, res) {
    i = parseInt(req.params.id) * 10;
    return res.redirect('back');
});

app.get('/delete/', function (req, res) {
    Contact.find({email: req.session.email}, function (err, user) {
        if (err)
        {
            console.log("Cannot fetch user");
            return;
        }

        let contactInfo = user[0].contactInfo;
        let contactIndex = contactInfo.findIndex(contact => contact.number === req.query.number);
        contactInfo.splice(contactIndex, 1);

        Contact.findOneAndUpdate({email: req.session.email}, { $set : {
                contactInfo: contactInfo
            }}, {
                new : true
            }, function (err, user) {
                if (err)
                {
                    console.log("Error updating user");
                    return;
                }

                return res.redirect('back');
            });
    });
});

app.get('/logOut/', function (req, res) {
    req.session.destroy();
    return res.redirect('/logIn');
});

app.listen(port, function (err) {
    if (err)
    {
        console.log("Unable to run " + err);
        return;
    }

    console.log("Working Perfectly...");
});