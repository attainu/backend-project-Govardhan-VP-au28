require('dotenv').config();

const express = require('express');
const app = express();
const ejs = require('ejs');
const ejsLint = require('ejs-lint');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const Emitter = require('events');

const PORT = process.env.PORT || 2005

const mongoose = require('mongoose');

var bodyParser = require('body-parser');
const { application } = require('express');
require('body-parser-zlib')(bodyParser);

// database connection

async function initMongoDB() {
    await mongoose.connect(process.env.MONGO_URL, (err) => {
        if (err) {
            console.log('mongodb Database Connection Failed')
        } else {
            console.log('mongodb Database Connection successfully established')
        }
    })
}
initMongoDB()


// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//session-config--
app.use(session({
    secret: process.env.Cookies_secret,
    resave: false,
    store: MongoDbStore.create({
        mongoUrl: process.env.MONGO_URL,
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } //i.e. 24hrs..

    // cookie: { maxAge: 1000 * 15 } //i.e. 15sec
}));

// Passport Config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize())
app.use(passport.session())

app.use(flash()); //middleware


//Assets

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

//Global middlewares
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// set templates
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');


// routes

require('./routes/web')(app);

app.use((req, res) => {
    require.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})