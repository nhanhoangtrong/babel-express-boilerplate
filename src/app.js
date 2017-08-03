import express from 'express'
import path from 'path'
import dotenv from 'dotenv'

import hbs from 'express-hbs'
import morgan from 'morgan'
import session from 'express-session'
import flash from 'express-flash'
import statusMonitor from 'express-status-monitor'
import bodyParser from 'body-parser'
import lusca from 'lusca'
import expressValidator from 'express-validator'
import errorhandler from 'errorhandler'

import mongoose from 'mongoose'

import connectMongo from 'connect-mongo'

import chalk from 'chalk'
import winston from 'winston'

/**
 * Import all the routes from ./routes
 */
import homeRoute from './routes/home'
import apiRoute from './routes/api'
import adminRoute from './routes/admin'
import ajaxRoute from './routes/ajax'

import * as passportConfig from './config/passport'
import passport from 'passport'
import registerAllHelpers from './views/helpers'

/**
 * Load the .env file
 */
dotenv.load({ path: path.join(__dirname, 'config.env') })

/**
 * Create an Express app
 */

const app = express()

/**
 * Then configurating and connecting to the MongoDB with Mongoose
 */
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_CONNECT_URI)
mongoose.connection.on('error', (err) => {
    winston.error(err)
    winston.info('%s - MongoDB connection error. Please make sure MongoDB is running.', chalk.red('Error'))
    process.exit(1)
})

/**
 * Running the migrations
 */
import migrate from 'migrate'
const set = migrate.load(path.resolve(__dirname, '../migrations/.migrate'), path.resolve(__dirname, '../migrations'))
// auto migrate
set.up((err) => {
    if (err) {
        return winston.error(err);
    }
    return winston.info(chalk.green('Migration process successfully!'))
})

/**
 * Setting the default configurations for express application
 */
app.engine('hbs', hbs.express4({
    partialsDir: path.join(__dirname, 'views', 'partials'),
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
}))
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

/**
 * Registering all custom Handlebars helpers
 */
registerAllHelpers(hbs)

/**
 * Registering global middlewares goes here
 */

// Morgan for logging requests and responses
app.use(morgan('dev'))
app.use(statusMonitor())

// Express session
const MongoStore = connectMongo(session)
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_CONNECT_URI,
    }),
    name: 'boilerplate.sid',
}))

// Flashing messages
app.use(flash())

// Parsing data
app.use(bodyParser.urlencoded({extended: true}))
// and validating data
app.use(expressValidator())

// Initializing passport
app.use(passport.initialize())
app.use(passport.session())

// Securing Cross Site Request Forgery (CSRF)
app.set('trust proxy', 1)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        next()
    } else {
        if (process.env.NODE_ENV === 'development' && req.method.toLowerCase() === 'post') {
            winston.info('%j', req.body)
        }
        lusca.csrf()(req, res, next)
    }
})
// Enabling X-FRAME-OPTIONS headers to help prevent Clickjacking.
app.use(lusca.xframe('SAMEORIGIN'))
// Enabling X-XSS-Protection headers to help prevent
// cross site scripting (XSS) attacks in older IE browsers (IE8)
app.use(lusca.xssProtection(true))

// Serve static files
app.use('/static', express.static(path.resolve(__dirname, '../static')))

/**
 * Registering routes goes here
 */
app.use('/', homeRoute)
app.use('/admin', adminRoute)
app.use('/ajax', ajaxRoute)
app.use('/api', apiRoute)


/**
 * Handling errors
 */
// Handling 404 not found
app.use((req, res, next) => {
    // AJAX requests
    if (req.xhr) {
        return res.status(404).send({
            message: 'Route not found',
        })
    }
    // Other requests
    return res.status(404).render('home/error', {
        title: 'Error 404',
        message: 'Page not found',
    })
})
if (process.env.NODE_ENV === 'development') {
    // only use errorhandler in development
    app.use((err, req, res, next) => {
        winston.info('errorhandler')
        errorhandler()(err, req, res, next)
    })
} else {
    // logging handler
    app.use((err, req, res, next) => {
        winston.error(err)
        return next(err)
    })

    // client error handler (AJAX)
    app.use((err, req, res, next) => {
        if (req.xhr) {
            return res.status(500).send({
                error: err,
            })
        }
        return next(err)
    })

    // server error handler
    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err)
        }
        return res.status(500).send()
    })
}

export default app
