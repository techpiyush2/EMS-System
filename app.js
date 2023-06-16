'use strict'

const path = require('path'),
    cors = require('cors'),
    morgan = require('morgan'),
    express = require('express'),
    // socket = require("socket.io"),
    bodyParser = require('body-parser'),
    Software = require('./app/api/v1/modules/software/models/software_model'),
    fileUpload = require('express-fileupload')
require('dotenv').config()
// var cron = require('node-cron')
// var cronFunctions = require("./app/lib/cronjob");
const cron = require('node-cron')
const { attendanceMailCron, attendanceLateMailCron } = require('./app/api/v1/modules/attendance/controllers/attendance_ctrl')

global._session = require('express-session')
global.__rootRequire = function (relpath) {
    return require(path.join(__dirname, relpath))
}

process.env.NODE_ENV = process.env.NODE_ENV || 'local' //local server
// process.env.NODE_ENV = process.env.NODE_ENV || 'staging'; //staging server
// process.env.NODE_ENV = process.env.NODE_ENV || 'prod'; //staging server

const config = require('./app/config/config').get(process.env.NODE_ENV)

const app = express()

app.use(cors())
app.use(fileUpload())
app.use(bodyParser.json())
app.use(express.json({ limit: '10kb' }))
app.use(bodyParser.urlencoded({ extended: false }))

cron.schedule('* * * * *', () => {
    cronFunctions.expireResetToken()
})

if (process.env.NODE_ENV === 'local') app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, './uploads')))

// All api requests
app.use(function (req, res, next) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*') // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,If-Modified-Since,Authorization,multipart/form-data')

    if (req.method == 'OPTIONS') {
        res.status(200).end()
    } else {
        next()
    }
})

app.use(
    _session({
        secret: 'something crazy',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
)

// Including database file
require('./app/config/db')

//used to get ip address
app.use('/', (req, res, next) => {
    console.log('Ip is' + req.ip)

    next()
})

//===============================================================

const schedule = require('node-schedule')

schedule.scheduleJob('00 00 8 * * *', async function () {
    attendanceMailCron()
    attendanceLateMailCron()
})

app.use('/api/mobile', require('./app/api/mobile/routes')(express))
app.use('/api/v1', require('./app/api/v1/routes')(express))

// Starting Server
const port = process.env.PORT || config.port
// const server = app.listen(port, () => {});

/** Server config */
const server = require('http').createServer(app)
console.log(`Server running on port ${port} ...`.cyan)
server.listen(port)

var ip = require('ip')

console.log(ip.address())
