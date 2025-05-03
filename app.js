const express  = require('express');
const session  = require('express-session');
const bodyPar  = require('body-parser');
const path     = require('path');
const flash    = require('connect-flash');
const hbs      = require('hbs');
require('dotenv').config();

const app  = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/main' });

hbs.registerPartials(path.join(__dirname, 'views', 'layouts'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper('eq', (a, b) => a == b);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyPar.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.user    = req.session.user || null;
  res.locals.message = req.flash('error');
  next();
});

app.use('/',        require('./routes/auth'));
app.use('/nurse',   require('./routes/nurse'));
app.use('/doctor',  require('./routes/doctor'));

const http = require('http').createServer(app);
const io   = require('socket.io')(http);

io.on('connection', socket => {
  socket.on('registerDoctor', id => socket.join('doctor:' + id));
});

app.set('io', io);

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`http://localhost:${PORT}`));
