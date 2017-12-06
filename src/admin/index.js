import { Router } from 'express';
import passport from 'passport';
import logger from '../logger';
import { isAdmin } from '../auth/middlewares';

import postRoute from './post';
import categoryRoute from './category';
import userRoute from './user';
import uploadRoute from './upload';
import localFileRoute from './localFile';
import enquiryRoute from './enquiry';

const router = Router();
/**
 * This is a middleware that check if user is try to log in as admin
 * or not. If not, it will redirect to homepage
 */
router.use((req, res, next) => {
    if (req.path === '/login') {
        next();
    } else {
        isAdmin({
            redirectUrl: (req) => `${req.baseUrl}/login?ref=${req.originalUrl}`,
            failOnError: false,
        })(req, res, next);
    }
}, (req, res, next) => {
    res.locals.user = req.user;
    res.locals._crsf = req.csrfToken;
    next();
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
    req.flash('success', 'You has been logged out.');
    res.redirect(`${req.baseUrl}/login`);
})
.post('/login', passport.authenticate('local', {
    failureRedirect: '/admin/login',
    failureFlash: 'Email or Password not matched.',
}), (req, res, next) => {
    // TODO: handle unauthorized status
    if (req.isAuthenticated()) {
        if (req.user.checkAdmin()) {
            req.flash('success', 'Administrator logged in successfully.');
            res.redirect(req.query.ref || req.baseUrl);
        } else {
            req.flash('error', 'Administrator only.');
            res.redirect('/');
        }
    } else {
        req.flash('error', 'Login errors.');
        res.redirect(`${req.baseUrl}/login?ref=${req.query.ref || req.baseUrl}`);
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
 * Render 404 error in admin
 */
.use((req, res) => {
    res.status(404).render('admin/error', {
        name: 'Error 404',
        message: 'Page Not Found.',
    });
})
// Render admin error page and
// send error to app-level error handler
.use((err, req, res, next) => {
    if (res.statusCode < 400) {
        res.statusCode = err.statusCode || 500;
    }
    res.render('admin/error', {
        name: err.name,
        message: err.message,
    });
    next(err);
});

export default router;
