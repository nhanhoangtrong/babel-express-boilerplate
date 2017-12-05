import { Router } from 'express';
import passport from 'passport';

import { Enquiry, Post } from '../models';

import postRoute from './post';
import categoryRoute from './category';
import accountRoute from './account';

export default Router()
.use((req, res, next) => {
    res.locals._csrf = req.csrfToken;
    res.locals.user = req.user;
    next();
})
.get('/', (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 0;
    const perPage = parseInt(req.query.per, 10) || 5;
    Post
        .find({isPublished: true})
        .populate('categories')
        .populate('author')
        .sort({publishedAt: -1})
        .skip(page * perPage)
        .limit(perPage)
        .exec()
        .then((posts) => {
            res.render('home/index', {
                title: 'Homepage',
                posts,
            });
        })
        .catch(next);
})
.use('/post', postRoute)
.use('/category', categoryRoute)
.use('/account', accountRoute)
.get('/login', (req, res, next) => {
    if (req.user) {
        return res.redirect(req.query.ref || '/');
    }
    return res.render('home/login', {
        title: 'Login',
        description: 'Login page',
    });
})
.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Email or Passowrd not matched',
}), (req, res, next) => {
    if (req.body.remember) {
        // remember for 7 days
        req.session.cookie.maxAge = 3600 * 1000 * 24 * 7;
    }
    return res.redirect(req.query.ref || '/');
})
.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect(req.query.ref || '/');
})
.get('/posts', (req, res, next) => {
    const perPage = parseInt(req.query.per, 10) || 10;
    const page = parseInt(req.query.page, 10) || 0;
    Post
    .find({isPublished: true})
    .populate('author')
    .populate('categories')
    .sort({publishedAt: -1})
    .skip(page * perPage)
    .limit(perPage)
    .exec()
    .then((posts) => {
        res.render('home/posts', {
            title: 'Recent posts',
            posts: posts,
            page: 0,
        });
    })
    .catch(next);
})
.get('/about', (req, res, next) => {
    res.render('home/about', {
        title: 'About us',
    });
})
.post('/enquiry', (req, res, next) => {
    Enquiry.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        content: req.body.content,
    })
    .then(() => {
        req.flash('success', 'New enquiry has been created successfully');
        res.redirect(req.path);
    })
    .catch((err) => {
        req.flash('error', err.message);
        res.redirect(req.path);
    });
});
