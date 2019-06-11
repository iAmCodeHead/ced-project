"use strict";
const  express  =  require('express');
const  bodyParser  =  require('body-parser');
const cors = require('cors')
// const  sqlite3  =  require('sqlite3').verbose();
const  jwt  =  require('jsonwebtoken');
const  bcrypt  =  require('bcryptjs');
const mongoose = require('mongoose');
const fetch = require("node-fetch");


// const database = "mongodb://localhost:27017/QuickSend";
const database = "mongodb://cedproject:group2@ds235947.mlab.com:35947/cedproject"
const SECRET_KEY = "secretkey23456";

const  app  =  express();
const  router  =  express.Router();
app.use(cors())

router.use(bodyParser.urlencoded({ extended:  false }));
router.use(bodyParser.json());
// const database = new sqlite3.Database("./my.db");

const MongoClient = require('mongodb').MongoClient;
//connecting to database
mongoose.connect(database, { useNewUrlParser: true });

const { ObjectID } = require('mongodb');

mongoose.connection.on('connected', () => {
    console.log('connected to the database ' + database);
});

mongoose.connection.on('error', (err) => {
    console.log('Database Error' + err);
});

  const userSchema = mongoose.Schema({
        student_name: {
            type: String,
            required: true
        },
        student_dept: {
            type: String,
            required: true
        },
        student_level: {
            type: String,
            required: true
        },
        mobile_no: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    });

   const Users = mongoose.model('users', userSchema);

    const newUser = (userData, callback) => {
        userData.save(callback);
    }
    const findUserByPhoneNumber = (mobile_no, cb) => {
        const query = {mobile_no};
        Users.findOne(query, cb);
    }
    const findClassMates = (student_dept, student_level, callback) => {
        const query = {
            student_dept,
            student_level
        };
        Users.find(query, callback);
    }

router.get('/', (req, res) => {
    res.status(200).send('This is an authentication server');
});

router.get('/register', (req, res) => {
    res.status(200).send('This is the registration route');
});

router.get('/login', (req, res) => {
    res.status(200).send('This is the login route');
});

router.post('/register', (req, res) => {
    let string = req.body.mobile_no
    string = string.replace(/^.{1}/g, '234');

    const userData = new Users({
        student_name: req.body.student_name,
        student_dept: req.body.student_dept,
        student_level: req.body.student_level,
        mobile_no: string,
        password: bcrypt.hashSync(req.body.password)
    });
    console.log(req.body);
    newUser(userData, (err, resp) => {
        // if(err) return  res.status(500).send("Server error!");
        if (err) throw err;
        // console.log(err);
        if (resp) {
            findUserByPhoneNumber(userData.mobile_no, (err, user) => {
                if (err) return  res.status(500).send('Server error for login attempt!');  
                const  expiresIn  =  24  *  60  *  60;
                const  accessToken  =  jwt.sign({ id:  user.id }, SECRET_KEY, {
                    expiresIn:  expiresIn
                });
                res.status(200).send({ "user":  user, "access_token":  accessToken, "expires_in":  expiresIn          
                });
            });
        }
    });
});


router.post('/login', (req, res) => {
    let string = req.body.mobile_no
    string = string.replace(/^.{1}/g, '234');

    const  mobile_no  =  string;
    const  password  =  req.body.password;

    findUserByPhoneNumber(mobile_no, (err, user) => {
        if (err) return  res.status(500).send('Server error!');
        if (!user) return  res.status(404).send('User not found!');
        // if (!user) return  res.json({success: false, msg: 'User not found!'});
        const  result  =  bcrypt.compareSync(password, user.password);
        if(!result) return  res.status(401).send('Password not valid!');

        const  expiresIn  =  24  *  60  *  60;
        const  accessToken  =  jwt.sign({ id:  user.id }, SECRET_KEY, {
            expiresIn:  expiresIn
        });
        res.status(200).send({ "user":  user, "access_token":  accessToken, "expires_in":  expiresIn});
    });
});

router.post('/send-sms', (req, res) => {
    const msg = encodeURIComponent(req.body.msg.msg);
    const dept = req.body.dept;
    const level = req.body.level;
    const mobile_no = req.body.mobile_no;
    const from = dept+' '+level;
    console.log(req.body);
    findClassMates(dept, level, (err, resp) => {
        if (err) throw err;
        if (resp) {
            console.log(resp);
            let recipient = [];
            // resp is an ARRAY of OBJECTS
                        for (let i = 0; i < resp.length; i++) {
                            if (resp[i].mobile_no !== mobile_no) {
                                const recipientObject = {
                                    msidn: resp[i].mobile_no,
                                    msgid: resp[i]._id
                                }
                                recipient.push(recipientObject);
                            }
                        }
                        console.log(recipient);
            const body = {
                SMS: {
                    auth: {
                        username: "akandesamson12@gmail.com",
                        apikey: "6246d76d185f7a183cede9d77cc1434f65d539e4"
                    },
                    message: {
                        sender: decodeURIComponent(from),
                        messagetext: decodeURIComponent(msg),
                        flash: "0"
                    },
                    recipients:
                    {
                        gsm: recipient
                    }
                }
            };
                        
            fetch(' http://api.ebulksms.com:8080/sendsms.json', {
                method: 'post',
                body: JSON.stringify(body),
                headers: { 'Content-Type':'application/json' },
            })
            .then(res => res.json())
            .then(json => console.log('res', json));
            res.json({
                success: true,
                msg: 'sent!',
                data: {}
            });
        }

    });
});

app.use(router);
const  port  =  process.env.PORT  ||  3000;
const  server  =  app.listen(port, () => {
    console.log('Server listening at http://localhost:'  +  port);
});