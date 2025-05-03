const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('connect-flash');
const hbs = require('hbs');
require('dotenv').config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.set('view options', { layout: 'layouts/main' });

hbs.registerPartials(path.join(__dirname, 'views', 'layouts'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.message = req.flash('error');
  next();
});

const authRoutes   = require('./routes/auth');
const nurseRoutes  = require('./routes/nurse');
const doctorRoutes = require('./routes/doctor');

app.use('/',        authRoutes);
app.use('/nurse',   nurseRoutes);
app.use('/doctor',  doctorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
