import { Router } from 'express'
import { resolve } from 'path'
import passport from 'passport'
import multer from 'multer'
import * as postPromises from '../../promises/post'
import * as userPromises from '../../promises/user'
import * as categoryPromises from '../../promises/postCategory'
import * as enquiryPromises from '../../promises/enquiry'
import postAdminRoute from './post'
import categoryAdminRoute from './category'
import userAdminRoute from './user'
import uploadAdminRoute from '../upload'
import localFileAdminRoute from './localFile'

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/uploads/')
    },
    filename: function (req, file, cb) {
        const nameParts = file.originalname.split('.')
        const ext = nameParts[nameParts.length - 1]

        cb(null, 'feature-image-' + Date.now() + '.' + ext);
    }
})

const uploads = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 1, // 1 MB
    }
})

const uploadImage = uploads.single('uploadImage')

const router = Router()

router
    /**
     * This is a middleware that check if user is try to log in as admin
     * or not. If not, it will redirect to homepage
     */
    .use(function(req, res, next) {
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
                next()
            } else {
                res.redirect('/')
            }
        } else {
            res.redirect('/admin/login')
        }
    })
    .get('/', function(req, res, next) {
        res.render('admin/dashboard', {
            title: 'Dashboard',
            section: "home",
        })
    })
    .get('/login', function(req, res, next) {
        res.render('admin/login', {
            title: 'Admin Login',
        })
    })
    .get('/logout', function(req, res, next) {
        req.logout()
        res.redirect('/admin/login')
    })
    .post('/login', passport.authenticate('local'), function(req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.checkAdmin()) {
                req.flash('success', 'Administrator logged in successfully')
                res.redirect('/admin')
            } else {
                res.redirect('/')
            }
        } else {
            req.flash('error', 'Login errors')
            res.redirect('/admin/login')
        }
    })
    /**
     * Upload media section
     */
    .use('/upload', uploadAdminRoute)
    .post('/upload/image', function(req, res, next) {
        uploadImage(req, res, function(err) {
            if (err) {
                res.json({
                    status: 'error',
                    code: 500,
                    message: err.message,
                })
            } else {
                if (req.file) {
                    res.json({
                        status: 'success',
                        code: 200,
                        message: 'Image has been uploaded successfully!',
                        url: `/static/uploads/${req.file.filename}`,
                    })
                } else {
                    res.json({
                        status: 'error',
                        code: 500,
                        message: 'There are some errors during uploading process!',
                    })
                }
            }
        })
    })
    .use('/post', postAdminRoute)
    .use('/category', categoryAdminRoute)
    .use('/user', userAdminRoute)
    .use('/local-file', localFileAdminRoute)

    /**
     * Enquiry section
     */
    .get('/enquiry/all', function(req, res, next) {
        enquiryPromises.getEnquiriesByPage(0, 10)
            .then(function(enquiries) {
                res.render('admin/enquiry-list', {
                    title: 'All Enquiries',
                    section: "enquiry",
                    enquiries: enquiries

                })
            }).catch(function(err) {
                console.error(err)
                res.render('admin/error', {
                    title: 'Error',
                    error: 'Error 500',
                    message: err.message,
                })
            })
    })
    /**
     * Settings section
     */
    .use('/settings', function(req, res, next) {
        res.render('admin/under-construction')
    })
    /**
     * Appearance section
     */
    .use('/appearance', function(req, res, next) {
        res.render('admin/under-construction')
    })
    /**
     * Handling page not found errors
     */
    .use(function(req, res, next) {
        res.render('admin/error', {
            title: 'Error',
            error: 'Error 404',
            message: 'Ops! Your page is not found.',
        })
    })

export default router
