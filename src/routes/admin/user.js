/* eslint-disable no-undef */
import { Router } from 'express'
import * as userPromises from '../../promises/user'
import { removePostsByAuthor } from '../../promises/post'

const router = Router()

router
/**
 * User section
 */
.get('/all', function(req, res, next) {
    userPromises.getUsersByPage(0, 20)
        .then(function(users) {
            res.render('admin/user-list', {
                title: 'All Users',
                section: "users",
                users: users,
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
.get('/new', function(req, res, next) {
    res.render('admin/user-edit', {
        title: `Creating a new user`,
        section: "users",
        edittedUser: {
            createdAt: Date.now(),
        },
    })
})
.post('/new', function(req, res, next) {
    if (req.body.password === req.body.repassword) {
        req.body.createdAt = new Date(req.body.createdAt).getTime()
        userPromises.postNewUser(req.body)
            .then(function() {
                req.flash('success', `User ${req.body.firstName} has been created successfully`)
                res.redirect('/admin/user/all')
            }).catch(function(err) {
                console.log(err)
                req.flash('error', err.message)
                res.render('admin/user-edit', {
                    title: `Creating a new user`,
                    section: "users",
                    edittedUser: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        createdAt: req.body.createdAt,
                        isAdmin: req.body.isAdmin,
                    },
                })
            })
    } else {
        req.flash('error', 'Re-type password does not match.')
        res.render('admin/user-edit', {
            title: `Creating a new user`,
            section: "users",
            edittedUser: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                createdAt: req.body.createdAt,
                isAdmin: req.body.isAdmin,
            },
        })
    }
})
.post('/remove', function(req, res, next) {
    const userId = req.body._id
    Promise.all([userPromises.removeUser(userId), removePostsByAuthor(userId)])
        .then(function(args) {
            const removedUser = args[0]
            const removedPosts = args[1]
            if (removedUser) {
                res.json({
                    status: 'ok',
                    code: 200,
                    message: `User '${removedUser.firstName} ${removedUser.lastName}' has been removed successfully!`,
                })
            } else {
                res.json({
                    status: 'error',
                    code: 404,
                    message: 'User was not found!',
                })
            }
        }).catch(function(err) {
            res.json({
                status: 'error',
                code: 500,
                message: err.message,
            })
        })
})
.get('/:userId', function(req, res, next) {
    userPromises.getUserById(req.params.userId)
        .then(function(user) {
            if (user) {
                return res.render('admin/user-edit', {
                    title: `Editing user ${user.firstName} ${user.lastName}`,
                    section: "users",
                    edittedUser: user,
                })
            }
            throw new Error('User not found')
        }).catch(function(err) {
            console.error(err)
            res.render('admin/error', {
                title: 'Error',
                error: 'Error 500',
                message: err.message,
            })
        })
})
.post('/:userId', function(req, res, next) {
    req.body.createdAt = new Date(req.body.createdAt).getTime()
    userPromises.updateUser(req.params.userId, req.body)
        .then(function() {
            req.flash('success', `User ${req.body.name} has been updated successfully`)
            res.redirect('/admin/user/all')
        }).catch(function(err) {
            console.error(err)
            req.flash('error', err.message)
            res.redirect('/admin/user/' + req.params.userId)
        })
})

export default router
