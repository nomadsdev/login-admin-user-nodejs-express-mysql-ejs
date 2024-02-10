const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000

app.use(session({
    secret: 'password',
    resave: true,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_admin_user'
});

db.connect((err) => {
    if (err) {
        console.error('Error connection to database');
    } else {
        console.log('Connected to database');
    }
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('login.ejs');
});

app.get('/admin', (req, res) => {
    res.render('admin_dashboard.ejs');
});

app.get('/user', (req, res) => {
    res.render('user_dashboard.ejs');
});
app.get('*', (req, res) => {
    res.render('Error');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            throw err;
        }
        if (results.length > 0) {
            const userType = results[0].userType;
            if (userType === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/user');
            }
        } else {
            res.redirect('/');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.redirect('*');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/admin', (req, res) => {
    if (!req.session.loggedin) {
        res.redirect('/');
    } else if (req.session.userType !== 'admin') {
        res.redirect('/user');
    } else {
        res.render('admin_dashboard.ejs');
    }
});

app.get('/admin', (req, res) => {
    if (!req.session.loggedin || req.session.userType !== 'admin') {
        res.redirect('/');
    } else {
        res.render('admin_dashboard.ejs');
    }
});

app.get('/user', (req, res) => {
    if (!req.session.loggedin || req.session.userType !== 'user') {
        res.redirect('/');
    } else {
        res.render('user_dashboard.ejs');
    }
});

app.listen(PORT, () => {
    console.log(`server is running port ${PORT}`);
});