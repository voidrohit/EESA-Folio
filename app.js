const express = require('express')
require('./db/mongoose')
require('dotenv').config()
const User = require('./models/user')
const Web = require('./models/web')
const imgModel = require('./models/avatar')
const About = require('./models/about')
const nodemailer = require('nodemailer')
var sha256 = require('js-sha256')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require("cookie-parser")
const MongodbSession = require('connect-mongodb-session')(session)
const Post = require('./models/post')
var fs = require('fs');
var path = require('path');
var multer = require('multer')

const store = new MongodbSession({
    uri: "mongodb+srv://voidrohit:Rks&18158920@cluster0.oiqtt.mongodb.net/EESAFolio?retryWrites=true&w=majority",
    collestion: 'sessions'
})

const app = express()
const port = process.env.PORT || 3030

app.use(cookieParser())
app.use(express.json())

app.use(express.static(__dirname + '/Public'));
app.use(bodyParser.urlencoded({extended: false}));

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname+ "-"+Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

app.use(session({
    cookie: {
        httpOnly: true,
        maxAge: null
    },
    secret: 'uniqueKey',   //********************************  change it man!! it must be secret  ******************************************//
    resave: false,
    saveUninitialized: false,
    store: store,
}))

const isAuth = (req, res, next) => {
    if(req.session.isAuth) {
        next()
    } else {
        console.log("false");
        res.redirect('/')
    }
}

app.set('view engine','ejs');

app.get('/sign', (req, res) => {
    res.render("index", {name: "", cross: "", wrong: ""});
})

app.get('/', (req, res) => {

    imgModel.find({subject: "Android"}).then((itemsAndroid) => {
        imgModel.find({subject: "Web"}).then((itemsWeb) => {
            imgModel.find({subject: "Core"}).then((itemsCore) => {
                if(itemsAndroid ==null) {
                    itemsAndroid = 0;
                }
                if(itemsWeb ==null) {
                    itemsWeb = 0;
                }
                if(itemsCore ==null) {
                    itemsCore = 0;
                }
                    res.render("dashboard", {style: "block", username: "Community NIT P", pass: "", src: "/images/avatar.jpg", style2: "block", itemsWeb: itemsWeb, itemsAndroid: itemsAndroid, itemsCore: itemsCore, authuser: "eesa", style3: "none"});
        })
    })
})
})

app.post('/users', (req, res) => {

    var email = req.body.email 
    var mailtext = ".ug19.ee@nitp.ac.in"
    
    String.prototype.isMatch = function(s){
        return this.match(s)!==null 
     }
     var flag = email.isMatch(mailtext)

    

    if(flag == false) {
        res.render("message", {message: "Only 2k19 Electrical Engineers can create account. Try using Official gmail account."})
    } else {
        const user = new User({
            first_name: req.body.first_name,
            username: req.body.username,
            email: req.body.email,
            password: sha256(req.body.password),
            subject : req.body.subject
        })
        
        var mailquery = User.find({email: req.body.email}); 
        var usernamequery = User.find({username: req.body.username}); 
    
        mailquery.countDocuments(function (err, count) { 
            if (count === 0) {
                usernamequery.countDocuments(function (err, count2) {
                    if (count2 === 0) {
                        user.save(function(err){
    
                            id = user._id
                            email = user.email
                            validation_code = sha256(user.username)
    
                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: "eesanitpatna@gmail.com" ,    // Sender email
                                    pass: "eesa&18158920"  // Sender password
                                }
                            });
                            
                            let mailOptions = {
                                from: 'eesanitpatna@gmail.com',
                                to: email,
                                subject: 'EESA Verification',
                                text: `Please click on the link provided to activate the account https://eesafolio.herokuapp.com/users/${email}/${validation_code}/${id}`
                                /////// Change text link while deploying
                            };
                            
                            transporter.sendMail(mailOptions, (err, data) => {
                                if (err) {
                                    res.render("message", {message: "Error occured"})
                                } else {
                                    res.render("message", {message: "Go to your gmail to verify the account"});
                                }
                        })
                        
                    })
                        } else {
                        res.render('index', { name: 'Username Already exist' , cross: "BACK TO LOGIN", wrong: ""})
                        // console.log("username already exist");
                    }
                    })
    
                } else {
                    res.render('index', { name: 'Email Already exist' , cross: "BACK TO LOGIN", wrong: ""})
                    // console.log("user already exist");
                }
                 
    })
    }
    
})

app.get('/users', (req, res) => {
    User.find({}).then((users) => {
        res.send(users)
    }).catch((e) => {
        res.send(400).send(e)
    })
})


app.get('/users/:email/:code/:id', (req, res) => {
    const email = req.params.email
    const validation_code = req.params.code
    const _id= req.params.id

    User.findByIdAndUpdate(_id ,{"active": true, "validation_code": validation_code}, function(err, result){

        if(err){
            res.render("message", {message: "Error occured"});
        }
        else{
            res.render("message", {message: "Account verified. Go to login page"});
        }

    })
})

app.post('/reset', (req, res) => {
    email = req.body.email

    User.find({email: email}, {
    active: 0,
    _id: 1,
    first_name: 0,
    username: 0,
    email: 0,
    password: 0,
    __v: 0}).then((users) => {

        validation_code = users[0]["validation_code"]
        id = users[0]["_id"]

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL ,    // Sender email
                pass: process.env.PASSWORD  // Sender password
            }
        });
        
        let mailOptions = {
            from: 'kabirsinghnitp@gmail.com',
            to: email,
            subject: 'Test',
            text: `Please click on the link provided to reset password https://eesafolio.herokuapp.com/reset/${email}/${validation_code}/${id}`
            /////// Change text link while deploying
        };
        
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                res.render("message", {message: "Error occured"});
            } else {
                res.render("message", {message: "Go to your gmail to reset password"});
            }
    })

        
    }).catch((e) => {
        res.send(400).send(e)
    })

})

app.get('/reset/:email/:code/:id', (req, res) => {
    const email = req.params.email
    const validation_code = sha256(req.params.code)
    const id= req.params.id

    res.render("resetPassword", {id: id})

})

app.post('/signin', (req, res) => {
    email = req.body.email
    password = sha256(req.body.password)

    User.find({email: email}, {
        active: 0,
        _id: 1,
        first_name: 0,
        __v: 0}).then((users) => {

            emaildb = users[0]["email"]
            passworddb = users[0]["password"]

            username = users[0]["username"]
            shausername = sha256(username)

            if( email == emaildb && password == passworddb ) {
                req.session.isAuth = true
                res.redirect(`/dashboard/${shausername}/${username}`)
            } else {
                res.render("index", {name: "", cross: "", wrong:"Wrong Credentials"})
            }
        }).catch((e) => {
            res.send(400).send(e)
        })


})

app.get("/dashboard/:pass/:username", isAuth, (req, res) => { 
    username= req.params.username
    pass=req.params.pass
    imgModel.find({subject: "Android"}).then((itemsAndroid) => {
        imgModel.find({subject: "Web"}).then((itemsWeb) => {
            imgModel.find({subject: "Core"}).then((itemsCore) => {
                imgModel.find({username: username}).then((item) => {
                if(itemsAndroid ==null) {
                    itemsAndroid = 0;
                }
                if(itemsWeb ==null) {
                    itemsWeb = 0;
                }
                if(itemsCore ==null) {
                    itemsCore = 0;
                }
                if(item.length==0) {
                    res.render("dashboard", {style: "none", username: username, pass: pass, src: "/images/avatar.jpg", style2: "block", authuser: username, style3: "block", itemsWeb: itemsWeb, itemsCore: itemsCore, itemsAndroid: itemsAndroid});
                } else
                    res.render("dashboard", {style: "none", username: username, pass: pass, src: `data:image/${item[0]["img"]["contentType"]};base64,${item[0]['img']['data'].toString('base64')}`, style2: "block", style3: "block", itemsWeb: itemsWeb, itemsAndroid: itemsAndroid, itemsCore: itemsCore, authuser: username});
                })
            })
        })
    })
})

app.post("/dashboard/:pass/:username", upload.single('file'), isAuth, (req, res) => {
    const file = req.file.filename;

    pass=req.body.pass
    username=req.body.username
    shausername = sha256(username)
    User.find({username: username}).then((user) => {
        
        var countImg = imgModel.find({username: username})

        var image = new imgModel({
        username: req.body.username,
        subject: user[0]['subject'],
        name: user[0]['first_name'],
        img: {
            data: fs.readFileSync(path.join(__dirname + '/Public/uploads/' + file)),
            contentType: 'image/png',
        }
    })
    countImg.countDocuments(function (err, count) { 
        imgModel.find({}).then((items) => {
        if(count>0) {
            imgModel.find({username: username}).then((getId) => {
                var id = getId[0]['_id']
                imgModel.findByIdAndUpdate(id, {img: {
                    data: fs.readFileSync(path.join(__dirname + '/Public/uploads/' + file)),
                    contentType: 'image/png',
                }}, (err, result) => {
                    res.redirect(`/dashboard/${shausername}/${username}`)
                })
            })
            
        } else {
            image.save(function (err, item){
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(item['img']);
                    res.redirect(`/dashboard/${shausername}/${username}`)
                }
            });
        }
        })
    })
    })
})
app.post('/', upload.single('file'), (req, res, next) => {
 
    var obj = {
        name: req.body.name,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    });
});

app.get("/about/:username", isAuth, (req, res) => {
    username = req.params.username
    const userquery = About.find({username: req.params.username})

    User.find({username: username}).then((user) => {
        const email = user[0]["email"];

        userquery.countDocuments(function(err, count) {
            if(count==0) {
                const about = new About({
                    username: username,
                })
            
                about.save();
                res.render("about", {username: username, text: "Write about yourself here", style1: "block", style2: "none", authuser: username, linkedin: null, github: null, whattsapp: null, skills: 0, skill: null, email: null, post: 0})
            } else {
                
            }
        })
        About.find({username: username}, function(err, result) {
            if(result.length == 0) {
                res.render("about", {username: username, text: text, style1: "block", style2: "none", authuser: username, linkedin: null, github: null, whattsapp: null, skills: 0, skill: null, post: 0})
            } else {
                var text = result[0]["text"]
                var skill = result[0]["skills"]
                var linkedin = result[0]["linkedin"]
                var github = result[0]["github"]
                var whattsapp = result[0]["whattsapp"]
                let skillArr=[];
                let word = "";
                if(skill==null) {
                    skill = 0;
                    skills =0
                }
                for(var i=0; i<skill.length; i++) {
                    word += skill[i];
                    if(skill[i] == " " || i == skill.length-1) {
                        skillArr.push(word);
                        word = "";
                    }
                }
                
                Post.find({username: username}, function(err, posts) {
                    if(posts==undefined || posts==null){
                        res.render("about", {username: username, text: text, style1: "block", style2: "none", authuser: username, linkedin: linkedin, github: github, whattsapp: whattsapp, skills: skillArr, skill: skill, email: email, post: 0})
                    } else {
                        res.render("about", {username: username, text: text, style1: "block", style2: "none", authuser: username, linkedin: linkedin, github: github, whattsapp: whattsapp, skills: skillArr, skill: skill, email: email, post: posts})
                    }
                })
            }
        })
    })
})

app.post('/aboutSubmit/:username', isAuth,(req, res) => {
    const username = req.params.username;
    const text = req.body.about;
    About.find({username: username}, function(err, about) {
        const id = about[0]['_id'];
        About.findByIdAndUpdate(id, {"text": text}, (err, result) => {
            tx = result["text"];
            res.redirect(`/about/${username}`)
        });
    })
})

app.get("/:username", (req, res) => {
    username = req.params.username
    const userquery = About.find({username: req.params.username})
    User.find({username: username}).then((user) => {
        userquery.countDocuments(function(err, count) {
            if(count==0) {
                res.render("about", {username: username, text: "Wait until user write someting here", style1: "none", style2: "none", authuser: username, linkedin: null, github: null, whattsapp: null, skills: "", skill: null, email: null, post: 0})
            } else {
                const email = user[0]["email"];
                About.find({username: username}, function(err, result) {
                    var text = result[0]["text"]
                    var skill = result[0]["skills"]
                    var linkedin = result[0]["linkedin"]
                    var github = result[0]["github"]
                    var whattsapp = result[0]["whattsapp"]
                    let skillArr=[];
                    let word = "";
                    if(skill==null) {
                        skill = 0;
                        skills =0
                    }
                    for(var i=0; i<skill.length; i++) {
                        word += skill[i];
                        if(skill[i] == " " || i == skill.length-1) {
                            skillArr.push(word);
                            word = "";
                        }
                    }
    
                    Post.find({username: username}, function(err, posts) {
                        if(posts==undefined || posts==null){
                            res.render("about", {username: username, text: text, style1: "none", style2: "none", authuser: username, linkedin: linkedin, github: github, whattsapp: whattsapp, skills: skillArr, skill: skill, email: email, post: 0})
                        } else {
                            res.render("about", {username: username, text: text, style1: "none", style2: "none", authuser: username, linkedin: linkedin, github: github, whattsapp: whattsapp, skills: skillArr, skill: skill, email: email, post: posts})
                        }
                    })
                })
            }
        })
    })
})

app.post('/skillSubmit/:username', isAuth,(req, res) => {
    const username = req.params.username;
    const {skills, linkedin, github, whattsapp, email }= req.body;
    About.find({username: username}, function(err, about) {
        const id = about[0]['_id'];
        About.findByIdAndUpdate(id, {"skills": skills, "linkedin": linkedin, "github": github, "whattsapp": whattsapp, "email": email}, (err, result) => {
            res.redirect(`/about/${username}`)
        });
    })
})
app.post('/post/:username', isAuth,(req, res) => {
    const username = req.params.username;
    const {heading, post }= req.body;

    const posts = new Post({
        username: username,
        heading: heading,
        about: post,
    })
    posts.save().then((_) => {

        res.redirect(`/about/${username}`)
    });



    
})
app.post('/deletePost/:username', isAuth, (req, res) => {
    const id = req.body.id
    const username = req.params.username
    
        Post.deleteOne({_id: id}, function(_, err) {
            console.log("success");
            res.redirect(`/about/${username}`) 
        });

})
app.post('/reset-password', (req, res) => {
    password = sha256(req.body.password)
    email = req.body.email ///// this is id

    // email is actually id
    User.findByIdAndUpdate(email ,{"password": password}, function(err, result){

        if(err){
            res.render("message", {message: "Error occured"});
        }
        else{
            res.render("message", {message: "Password reset successful! Go to login page"});
        }

    })
})

app.post('/logout', isAuth,(req, res) => {
    req.session.destroy((err) =>{
        if(err) throw err
        res.redirect(`/`);
    })
})
app.listen(port, () => {
    console.log('Server is running on port ' + port)
})
