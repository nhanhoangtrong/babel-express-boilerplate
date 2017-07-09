import { Router } from 'express'
import passport from 'passport'
import * as passportConfig from '../config/passport'
import { updateUserInfo, updateUserPassword } from '../promises/user'

const router = Router()

router
    .get('/', passportConfig.isAuthenticated, function(req, res, next) {
        res.render('home/account', {
            title: 'Account',
            user: req.user,
        })
    })
    .post('/', passportConfig.isAuthenticated, function(req, res, next) {
        req.body._id = req.user._id
        if (req.body.password && req.body.password === req.body.repassword) {
            Promise.all([updateUserInfo(req.body), updateUserPassword(req.body._id, req.body.password)])
                .then(function() {
                    req.flash('success', 'User profile and password have been updated successfully!')
                    res.redirect('/account')
                }).catch(function(err) {
                    console.error(err)
                    res.render('home/error', {
                        title: 'Error 500',
                        error: 'Error 500',
                        message: 'Something went wrong! Please try later.'
                    })
                })
        } else {
            updateUserInfo(req.body).then(function() {
                req.flash('success', 'User profile has been updated successfully!')
                res.redirect('/account')
            }).catch(function(err) {
                console.error(err)
                res.render('home/error', {
                    title: 'Error 500',
                    error: 'Error 500',
                    message: 'Something went wrong! Please try later.'
                })
            })
        }
    })

export default router
