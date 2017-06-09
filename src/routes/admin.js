import { Router } from 'express'
import passport from 'passport'
import * as postPromises from '../promises/post'
import * as userPromises from '../promises/user'
import * as categoryPromises from '../promises/postCategory'
import * as enquiryPromises from '../promises/enquiry'

const router = Router()

router
    /**
     * This is a middleware that check if user is try to log in as admin
     * or not. If not, it will redirect to homepage
     */
    .use(function(req, res, next) {
        // Test if user try to access login page
        if (req.path === '/login') {
            return next()
        }
        // Check if user is authenticated or not
        if (req.isAuthenticated()) {
            // Check if user is admin or not
            // If not, redirect to homepage
            if (req.user.checkAdmin()) {
                next()
            } else {
                res.redirect('/')
            }
        } else {
            res.redirect('/admin/login')
        }
    })
    .get('/', function(req, res, next) {
        res.render('admin/dashboard', {
            title: 'Dashboard',
            section: "home",
            user: req.user,
        })
    })
    .get('/login', function(req, res, next) {
        res.render('admin/login', {
            title: 'Admin Login',
            _csrf: req.csrfToken,
        })
    })
    .get('/logout', function(req, res, next) {
        req.logout()
        res.redirect('/admin/login')
    })
    .post('/login', passport.authenticate('local'), function(req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.checkAdmin()) {
                req.flash('success', 'Administrator logged in successfully')
                res.redirect('/admin')
            } else {
                res.redirect('/')
            }
        } else {
            req.flash('error', 'Login errors')
            res.redirect('/admin/login')
        }
    })
    /**
     * Posts section
     */
    .get('/post/all', function(req, res, next) {
        postPromises.getPostsByPage(0, 10).then(function(posts) {
            res.render('admin/post-list', {
                title: 'All posts',
                section: "post",
                _csrf: req.csrfToken,
                user: req.user,
                posts: posts,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('admin/error', {
                title: 'Error',
                message: 'Error 500'
            })
        })
    })
    .get('/post/new', function(req, res, next) {
        Promise.all([userPromises.getAllUsers(), categoryPromises.getAllPostCategories()]).then(function(args) {
            const users = args[0]
            const postCategories = args[1]
            res.render('admin/post-edit', {
                title: `Create a new post`,
                section: "post",
                post: {
                    author: {},
                    categories: [],
                    publishedAt: Date.now(),
                },
                postCategories: postCategories,
                _csrf: req.csrfToken,
                user: req.user,
                users: users,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('admin/error', {
                title: 'Error',
                error: 'Error 500',
            })
        })
    })
    .post('/post/new', function(req, res, next) {
        req.body.publishedAt = new Date(req.body.publishedAt).getTime()
        postPromises.postNewPost(req.body).then(function(post) {
            req.flash('success', `Post '${post.title}' has been created successfully`)
            res.redirect('/admin/post/all')
        }).catch(function(err) {
            console.error(err)
            req.flash('error', err.message)
            res.redirect('/admin/post/new')
        })
    })
    .post('/post/remove', function(req, res, next) {
        postPromises.removePost(req.body._id)
            .then(function(removedPost) {
                if (removedPost) {
                    res.json({
                        status: 'success',
                        code: 200,
                        message: `Post ${removedPost.title} has been removed successfully!`,
                    })
                } else {
                    res.json({
                        status: 'error',
                        code: 404,
                        message: err.message
                    })
                }
            }).catch(function(err) {
                console.error(err)
                res.json({
                    status: 'error',
                    code: 500,
                    message: err.message
                })
            })
    })
    .get('/post/:postId', function(req, res, next) {
        Promise.all([postPromises.getPostById(req.params.postId), userPromises.getAllUsers(), categoryPromises.getAllPostCategories()])
            .then(function(args) {
                const post = args[0]
                const users = args[1]
                const postCategories = args[2]
                res.render('admin/post-edit', {
                    title: `Edit post "${post.title}"`,
                    section: "post",
                    post: post,
                    postCategories,
                    _csrf: req.csrfToken,
                    user: req.user,
                    users: users,
                })
            }).catch(function(err) {
                res.render('admin/error', {
                    title: 'Error',
                    error: 'Error 500',
                })
            })
    })
    .post('/post/:postId', function(req, res, next) {
        req.body._id = req.params.postId
        req.body.publishedAt = new Date(req.body.publishedAt).getTime()
        postPromises.updatePost(req.body).then(function() {
            req.flash('success', `Post '${req.body.title}' has been updated successfully`)
            res.redirect(`/admin/post/${req.params.postId}`)
        }).catch(function(err) {
            console.error(err)
            req.flash('error', err.message)
            res.redirect(`/admin/post/${req.params.postId}`)
        })
    })
    /**
     * PostCategory section
     */
    .get('/category/all', function(req, res, next) {
        categoryPromises.getAllPostCategories()
            .then(function(postCategories) {
                res.render('admin/category-list', {
                    title: `All Post Categories`,
                    section: "category",
                    postCategories,
                    user: req.user,
                })
            }).catch(function(err) {
                console.error(err)
                res.render('admin/error', {
                    title: 'Error',
                    error: 'Error 500',
                })
            })
    })
    .get('/category/new', function(req, res, next) {
        res.render('admin/category-edit', {
            title: 'Create a new Post category',
            section: "category",
            postCategory: {},
            _csrf: req.csrfToken,
            user: req.user,
        })
    })
    .post('/category/new', function(req, res, next) {
        categoryPromises.postNewPostCategory(req.body)
            .then(function(postCategory) {
                req.flash('success', `Category ${postCategory.name} has been created successfully`)
                res.redirect('/admin/category/all')
            }).catch(function(err) {
                console.error(err)
                req.flash('error', `${err.message}`)
                res.redirect('/admin/category/new')
            })
    })
    .post('/category/remove', function(req, res, next) {
        const catId = req.body._id
        Promise.all([categoryPromises.removePostCategory(catId), postPromises.removeCategoryFromPost(catId)])
            .then(function(args) {
                const removedCategory = args[0]
                if (removedCategory) {
                    res.json({
                        status: 'success',
                        code: 200,
                        message: `Category '${removedCategory.name}' has been removed successfully!`,
                    })
                } else {
                    res.json({
                        status: 'error',
                        code: 404,
                        message: 'Category was not found!',
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
    .get('/category/:catId', function(req, res, next) {
        categoryPromises.getPostCategoryById(req.params.catId)
            .then(function(postCategory) {
                res.render('admin/category-edit', {
                    title: `Edit "${postCategory.name}" category`,
                    section: "category",
                    postCategory,
                    _csrf: req.csrfToken,
                    user: req.user,
                })
            })
    })
    .post('/category/:catId', function(req, res, next) {
        req.body._id = req.params.catId
        console.log(req.body)
        categoryPromises.updatePostCategory(req.body)
            .then(function() {
                req.flash('success', `Category ${req.body.name} has been updated successfully`)
                res.redirect('/admin/category/all')
            }).catch(function(err) {
                console.error(err)
                req.flash('error', `${err.message}`)
                res.redirect('/admin/category/all')
            })
    })
    /**
     * Enquiry section
     */
    .get('/enquiry/all', function(req, res, next) {
        enquiryPromises.getEnquiriesByPage(0, 10)
            .then(function(enquiries) {
                res.render('admin/enquiry-list', {
                    title: 'All Enquiries',
                    user: req.user,
                    section: "enquiry",
                    enquiries: enquiries

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
    /**
     * User section
     */
    .get('/user/all', function(req, res, next) {
        userPromises.getUsersByPage(0, 20)
            .then(function (users) {
                res.render('admin/user-list', {
                    title: 'All Users',
                    section: "users",
                    user: req.user,
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
    .get('/user/new', function(req, res, next) {
        res.render('admin/user-edit', {
            title: `Creating a new user`,
            user: req.user,
            section: "users",
            _csrf: req.csrfToken,
            edittedUser: {
                createdAt: Date.now(),
            },
        })
    })
    .post('/user/new', function(req, res, next) {
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
                        user: req.user,
                        section: "users",
                        _csrf: req.csrfToken,
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
                user: req.user,
                section: "users",
                _csrf: req.csrfToken,
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
    .post('/user/remove', function(req, res, next) {
        const userId = req.body._id
        Promise.all([userPromises.removeUser(userId), postPromises.removePostByAuthor(userId)])
            .then(function(args) {
                const removedUser = args[0]
                const removedPosts = args[1]
                if (removedUser) {
                    res.json({
                        status: 'success',
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
    .get('/user/:userId', function(req, res, next) {
        userPromises.getUserById(req.params.userId)
            .then(function(user) {
                if (user) {
                    return res.render('admin/user-edit', {
                        title: `Editing user ${user.firstName} ${user.lastName}`,
                        user: req.user,
                        section: "users",
                        _csrf: req.csrfToken,
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
    .post('/user/:userId', function(req, res, next) {
        req.body.createdAt = new Date(req.body.createdAt).getTime()
        userPromises.updateUser(req.params.userId, req.body)
            .then(function() {
                req.flash('success', `Category ${req.body.name} has been updated successfully`)
                res.redirect('/admin/category/all')
            }).catch(function(err) {
                console.error(err)
                req.flash('error', err.message)
                res.redirect('/admin/user/' + req.params.userId)
            })
    })
    /**
     * Settings section
     */
    .use('/settings', function(req, res, next) {
        res.render('admin/under-construction')
    })
    /**
     * Appearance section
     */
    .use('/appearance', function(req, res, next) {
        res.render('admin/under-construction')
    })
    /**
     * Handling page not found errors
     */
    .use(function(req, res, next) {
        res.render('admin/error', {
            title: 'Error',
            error: 'Error 404',
            message: 'Ops! Your page is not found.',
        })
    })

export default router
