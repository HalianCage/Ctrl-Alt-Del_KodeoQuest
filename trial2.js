const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const flash = require('connect-flash');
const session = require('express-session');
const crypto = require('crypto');
const User = require('./models/User');
const questionRoutes = require('./routes/questionroutes');
const Question = require('./models/Question');
const path = require('path');

const sessionSecret = crypto.randomBytes(32).toString('hex');

// Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/Build', express.static(path.join(__dirname, 'Build')));
app.use('/TemplateData', express.static(path.join(__dirname, 'TemplateData')));

// Use 'public' directory to serve the Unity index.html and other static files
app.use('/public', express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(flash());

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/loginPage');
}

// MongoDB connection
const dbURL = 'mongodb+srv://trial1:b0urb0nk@trial.kevezfl.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Trial';

mongoose.connect(dbURL)
    .then(() => {
        console.log("Connected to database successfully!");
        app.listen(5500);
    })
    .catch((err) => {
        console.log(err);
    });

// Routes
app.use('/auth', authRoutes);
app.use('/forum', questionRoutes);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve static files
app.use(express.static('static_files'));

// Home page
app.get('', (req, res) => {
    res.render('preLoginPage');
});

// Main page (authenticated)
app.get('/main', isAuthenticated, (req, res) => {
    res.render('homePage', { title: 'main' });
});

// Login page
app.get('/loginPage', (req, res) => {
    res.render('loginPage.ejs');
});

// Signup page
app.get('/signup', (req, res) => {
    res.render('signupPage.ejs');
});

// Videos page
app.get('/videos', (req, res) => {
    res.render('animationVideos.ejs');
});

// Games page
app.get('/games', (req, res) => {
    res.render('Games.ejs');
});

app.get('/game1', (req, res) => {
    // Unity WebGL build files are already being served statically
    res.sendFile(path.join(__dirname,'public', 'index.html'));
});


// Forum page
// app.get('/forum', (req, res) => {
//     res.render('forum.ejs');
// });

// Route to fetch all questions
app.get('/forum', async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.render('forum.ejs', { questions });
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).send('Error fetching questions');
    }
});

// Forum post question page
app.get('/forum-postQuestion', (req, res) => {
    res.render('postQuestion.ejs');
});

app.get('/progressreport', (req, res) => {
    res.render('progressReports.ejs');
});

// Account settings page (authenticated)
app.get('/accountSettings', isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render('accountSettings.ejs', { user });
});

// 404 page
app.use((req, res) => {
    res.render('404');
});

module.exports = app;
