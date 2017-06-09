import { Router } from 'express'
import { getAllPostCategories } from '../promises/postCategory'
import { getPostsByPage } from '../promises/post'
import { postNewEnquiry } from '../promises/enquiry'
import passport from 'passport'
import bodyParser from 'body-parser'

const router = Router()

router
    .get('/', function(req, res, next) {
        getAllPostCategories().then(function(postCategories) {
            res.render('home/index', {
                title: 'Homepage',
                _csrf: req.csrfToken,
                user: req.user,
                postCategories: postCategories,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('home/error', {
                _csrf: req.csrfToken,
                title: 'Error 500',
            })
        })
    })
    .get('/login', function(req, res, next) {
        if (req.user) {
            res.redirect('/')
        }
        res.render('home/login', {
            title: 'Login',
            description: 'Login page',
            _csrf: req.csrfToken,
        })
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
                _csrf: req.csrfToken,
                posts: posts,
                page: 0,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('home/error', {
                _csrf: req.csrfToken,
                title: 'Error 500',
            })
        })
    })
    .get('/about', function(req, res, next) {
        res.render('home/about', {
            title: 'About us',
            _csrf: req.csrfToken,
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
