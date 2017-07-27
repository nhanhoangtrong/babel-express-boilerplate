import { Router } from 'express'
import * as postPromises from '../../promises/post'
import * as userPromises from '../../promises/user'
import * as categoryPromises from '../../promises/postCategory'

const router = Router()

router
    /**
     * Posts section
     */
    .get('/all', function(req, res, next) {
        postPromises.getPostsByPage(0, 10).then(function(posts) {
            res.render('admin/post-list', {
                title: 'All posts',
                section: "post",
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
    .get('/new', function(req, res, next) {
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
    .post('/new', function(req, res, next) {
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
    .post('/remove', function(req, res, next) {
        postPromises.removePost(req.body._id)
            .then(function(removedPost) {
                if (removedPost) {
                    res.json({
                        status: 'ok',
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
    .get('/:postId', function(req, res, next) {
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
                    users: users,
                })
            }).catch(function(err) {
                res.render('admin/error', {
                    title: 'Error',
                    error: 'Error 500',
                })
            })
    })
    .post('/:postId', function(req, res, next) {
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

export default router
