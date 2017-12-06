import { Router } from 'express';
import passport from 'passport';

import { Enquiry, Post } from '../models';

import postRoute from './post';
import categoryRoute from './category';
import accountRoute from './account';

const router = Router();
router.use((req, res, next) => {
    res.locals._csrf = req.csrfToken;
    res.locals.user = req.user;
    next();
})
.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.per, 10) || 9;
        const posts = await Post
            .find({ isPublished: true })
            .populate('categories')
            .populate('author')
            .sort({ publishedAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        res.render('home/index', {
            title: 'Homepage',
            posts,
        });
    } catch (err) {
        next(err);
    }
})
.use('/post', postRoute)
.use('/category', categoryRoute)
.use('/account', accountRoute)
.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect(req.query.ref || req.baseUrl);
    }
    return res.render('home/login', {
        title: 'Log-in to your account',
        description: 'Login page',
    });
})
.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Email or Passowrd not matched',
}), (req, res) => {
    if (req.body.remember) {
        // remember for 7 days
        req.session.cookie.maxAge = 3600 * 1000 * 24 * 7;
    }
    return res.redirect(req.query.ref || '/');
})
.get('/logout', (req, res) => {
    req.logout();
    res.redirect(req.query.ref || '/login');
})
.get('/posts', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.per, 10) || 9;
        const posts = await Post
            .find({ isPublished: true })
            .populate('categories')
            .populate('author')
            .sort({ publishedAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        res.render('home/posts', {
            title: 'Posts',
            posts,
        });
    } catch (err) {
        next(err);
    }
})
.get('/about', (req, res, next) => {
    res.render('home/about', {
        title: 'About us',
    });
})
.post('/enquiry', async (req, res, next) => {
    try {
        const enquiry = await Enquiry.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            content: req.body.content,
        });
        req.flash('success', 'New enquiry has been created successfully');
        res.redirect(req.originalUrl);

    } catch (err) {
        req.flash('error', err.message);
        res.redirect(req.originalUrl);
    }
})
.use((req, res) => {
    // Send Not Found response to AJAX requests
    if (req.xhr || req.is('application/json')) {
        return res.status(404).send({
            name: 'Error 404',
            message: 'Route Not Found.',
        });
    }
    // Render Not Found template
    return res.status(404).render('home/error', {
        name: 'Error 404',
        message: 'Page Not Found.'
    });
})
// Render home error page and
// send error to app-level error handler
.use((err, req, res, next) => {
    if (res.statusCode < 400) {
        res.statusCode = err.statusCode || 500;
    }
    res.render('home/error', {
        name: err.name,
        message: err.message,
    });
    next(err);
});
export default router;
