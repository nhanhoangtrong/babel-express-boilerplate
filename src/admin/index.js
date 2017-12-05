import { Router } from 'express';
import passport from 'passport';
import logger from '../logger';

import postRoute from './post';
import categoryRoute from './category';
import userRoute from './user';
import uploadRoute from './upload';
import localFileRoute from './localFile';
import enquiryRoute from './enquiry';

export default Router()
    /**
     * This is a middleware that check if user is try to log in as admin
     * or not. If not, it will redirect to homepage
     */
    .use((req, res, next) => {
        // Test if user try to access login page
        res.locals._csrf = req.csrfToken;
        if (req.path === '/login') {
            return next();
        }
        // Check if user is authenticated or not
        if (req.isAuthenticated()) {
            // Check if user is admin or not
            // If not, redirect to homepage
            if (req.user.checkAdmin()) {
                res.locals.user = req.user;
                return next();
            }
            return res.redirect('/');
        }
        return res.redirect('/admin/login');
    })
    .get('/', (req, res, next) => {
        res.render('admin/dashboard', {
            title: 'Dashboard',
            section: 'home',
        });
    })
    .get('/login', (req, res, next) => {
        res.render('admin/login', {
            title: 'Admin Login',
        });
    })
    .get('/logout', (req, res, next) => {
        req.logout();
        res.redirect('/admin/login');
    })
    .post('/login', passport.authenticate('local', {
        failureRedirect: '/admin/login',
        failureFlash: 'Email or Password not matched',
    }), (req, res, next) => {
        // TODO: handle unauthorized status
        if (req.isAuthenticated()) {
            if (req.user.checkAdmin()) {
                req.flash('success', 'Administrator logged in successfully');
                res.redirect(req.query.ref || '/admin');
            } else {
                req.flash('error', 'Administrator only');
                res.redirect('/');
            }
        } else {
            req.flash('error', 'Login errors');
            res.redirect(`/admin/login?ref=${req.query.ref || '/admin'}`);
        }
    })
    /**
     * Upload media section
     */
    .use('/upload', uploadRoute)
    .use('/post', postRoute)
    .use('/category', categoryRoute)
    .use('/user', userRoute)
    .use('/local-file', localFileRoute)
    /**
     * Enquiry section
     */
    .use('/enquiry', enquiryRoute)
    /**
     * Settings section
     */
    .use('/settings', (req, res) => {
        res.render('admin/under-construction');
    })
    /**
     * Appearance section
     */
    .use('/appearance', (req, res) => {
        res.render('admin/under-construction');
    })
    /**
     * Handling page not found admin errors
     */
    .use((req, res) => {
        res.render('admin/error', {
            title: 'Error 404',
            error: new Error('Page not found'),
            message: 'Page not found',
        });
    })
    .use((err, req, res, next) => {
        if (process.env.NODE_ENV === 'development') {
            return next(err);
        }
        logger.error('%j', err);
        delete err.stack;
        return res.render('admin/error', {
            title: 'Error 500',
            error: err,
            message: 'Internal Server Error',
        });
    });
