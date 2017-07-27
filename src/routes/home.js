import { Router } from 'express'
import passport from 'passport'
import bodyParser from 'body-parser'

import { getAllPostCategories } from '../promises/postCategory'
import { getPostsByPage } from '../promises/post'
import { postNewEnquiry } from '../promises/enquiry'
import Post from '../models/Post'

const router = Router()

router
    .use(function(req, res, next) {
        res.locals._csrf = req.csrfToken
        next()
    })
    .get('/', function(req, res, next) {
        Post.find({isPublished: true}).sort({'publishedAt': -1}).limit(10).exec()
        .then(function(posts) {
            res.render('home/index', {
                title: 'Homepage',
                user: req.user,
                posts,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('home/error', {
                title: 'Error 500',
            })
        })
    })
    .get('/login', function(req, res, next) {
        if (req.user) {
            res.redirect('/')
        } else {
            res.render('home/login', {
                title: 'Login',
                description: 'Login page',
            })
        }
    })
    .post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
    }), function(req, res, next) {
        if (req.body.remember) {
            // remember for 7 days
            req.session.cookie.maxAge = 3600 * 1000 * 24 * 7
        }
        res.redirect('/')
    })
    .get('/logout', function(req, res, next) {
        req.logout()
        res.redirect('/')
    })
    .get('/posts', function(req, res, next) {
        getPostsByPage(0, 5).then(function(posts) {
            res.render('home/posts', {
                title: 'Recent posts',
                user: req.user,
                posts: posts,
                page: 0,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('home/error', {
                title: 'Error 500',
            })
        })
    })
    .get('/about', function(req, res, next) {
        res.render('home/about', {
            title: 'About us',
            user: req.user,
        })
    })
    .post('/enquiry', function(req, res, next) {
        postNewEnquiry(req.body).then(function() {
            req.flash('success', 'New enquiry has been created successfully')
            res.redirect('/')
        }).catch(function(err) {
            req.flash('error', err.message)
            res.redirect('/')
        })
    })

export default router
