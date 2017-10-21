/* eslint-disable no-undef */
import { Router } from 'express'
import passport from 'passport'
import { isAuthenticated } from '../middlewares/passport'
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
    if (req.body.password) {
        if (req.body.password === req.body.repassword) {
            User.findByIdAndUpdate(req.body._id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: req.body.password,
            })
            .exec()
            .then((user) => {
                req.flash('success', 'User profile and password have been updated successfully!')
                res.redirect('/account')
            }).catch((err) => {
                req.flash('error', err.message)
                res.render('home/account', {
                    title: 'Account',
                    user: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                    }
                })
            })
        } else {
            req.flash('error', 'Re-password not match!')
            res.render('home/account', {
                title: 'Account',
                user: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                }
            })
        }
    } else {
        User.findByIdAndUpdate(req.body._id, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        })
        .exec()
        .then((user) => {
            req.flash('success', 'User profile has been updated successfully!')
            res.redirect('/account')
        }).catch((err) => {
            req.flash('error', err.message)
            res.render('home/account', {
                title: 'Account',
                user: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                }
            })
        })
    }
})
