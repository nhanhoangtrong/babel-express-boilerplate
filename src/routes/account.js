/* eslint-disable no-undef */
import { Router } from 'express'
import passport from 'passport'
import { isAuthenticated } from '../config/passport'
import User from '../models/User'

export default Router()
.use(isAuthenticated)
.get('/', (req, res, next) => {
    res.render('home/account', {
        title: 'Account',
        user: req.user,
    })
})
.post('/', (req, res, next) => {
    req.body._id = req.user._id
    if (req.body.password && req.body.password === req.body.repassword) {
        User.findByIdAndUpdate(req.body._id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
        })
        .exec()
        .then(() => {
            req.flash('success', 'User profile and password have been updated successfully!')
            res.redirect('/account')
        }).catch((err) => {
            console.error(err)
            res.render('home/error', {
                title: 'Error 500',
                error: 'Error 500',
                message: 'Something went wrong! Please try later.'
            })
        })
    } else {
        User.findByIdAndUpdate(req.body._id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        })
        .exec()
        .then(() => {
            req.flash('success', 'User profile has been updated successfully!')
            res.redirect('/account')
        }).catch((err) => {
            console.error(err)
            res.render('home/error', {
                title: 'Error 500',
                error: 'Error 500',
                message: 'Something went wrong! Please try later.'
            })
        })
    }
})
