import { Router } from 'express'
import { resolve } from 'path'
import passport from 'passport'

import postAdminRoute from './post'
import categoryAdminRoute from './category'
import userAdminRoute from './user'
import uploadAdminRoute from '../upload'
import localFileAdminRoute from './localFile'

import Enquiry from '../../models/Enquiry'

export default Router()
/**
 * This is a middleware that check if user is try to log in as admin
 * or not. If not, it will redirect to homepage
 */
.use((req, res, next) => {
    // Test if user try to access login page
    res.locals._csrf = req.csrfToken
    if (req.path === '/login') {
        return next()
    }
    // Check if user is authenticated or not
    if (req.isAuthenticated()) {
        // Check if user is admin or not
        // If not, redirect to homepage
        if (req.user.checkAdmin()) {
            res.locals.user = req.user
            return next()
        }
        return res.redirect('/')
    }
    return res.redirect('/admin/login')
})
.get('/', (req, res, next) => {
    res.render('admin/dashboard', {
        title: 'Dashboard',
        section: 'home',
    })
})
.get('/login', (req, res, next) => {
    res.render('admin/login', {
        title: 'Admin Login',
    })
})
.get('/logout', (req, res, next) => {
    req.logout()
    res.redirect('/admin/login')
})
.post('/login', passport.authenticate('local',{
    failureRedirect: '/admin/login',
}), (req, res, next) => {
    // TODO: handle unauthorized status
    if (req.isAuthenticated()) {
        if (req.user.checkAdmin()) {
            req.flash('success', 'Administrator logged in successfully')
            res.redirect(req.query.ref || '/admin')
        } else {
            req.flash('error', 'Administrator only')
            res.redirect('/')
        }
    } else {
        req.flash('error', 'Login errors')
        res.redirect(`/admin/login?ref=${req.query.ref || '/admin'}`)
    }
})
/**
 * Upload media section
 */
.use('/upload', uploadAdminRoute)
.use('/post', postAdminRoute)
.use('/category', categoryAdminRoute)
.use('/user', userAdminRoute)
.use('/local-file', localFileAdminRoute)
/**
 * Enquiry section
 */
.get('/enquiry/all', (req, res, next) => {
    const page = req.query.page || 0
    const perPage = req.query.per || 20
    Enquiry.find({})
    .skip(page * perPage)
    .limit(perPage)
    .exec()
    .then((enquiries) => {
        res.render('admin/enquiry-list', {
            title: 'All Enquiries',
            section: 'enquiry',
            enquiries: enquiries

        })
    }).catch(next)
})
/**
 * Settings section
 */
.use('/settings', (req, res, next) => {
    res.render('admin/under-construction')
})
/**
 * Appearance section
 */
.use('/appearance', (req, res, next) => {
    res.render('admin/under-construction')
})
/**
 * Handling page not found admin errors
 */
.use((req, res, next) => {
    res.render('admin/error', {
        title: 'Error 404',
        error: new Error('Page not found'),
        message: 'Page not found',
    })
})
.use((err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        return next(err)
    }
    console.error(err)
    delete err.stack
    return res.render('admin/error', {
        title: 'Error 500',
        error: err,
        message: 'Internal Server Error',
    })
})
