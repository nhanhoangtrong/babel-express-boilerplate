/* eslint-disable no-undef */
import { Router } from 'express'

import User from '../../models/User'
import Post from '../../models/Post'
import PostCategory from '../../models/PostCategory'

export default Router()
/**
 * Posts section
 */
.get('/all', (req, res, next) => {
    const page = req.query.page
    const perPage = req.query.per
    Post.find({})
    .skip(page * perPage)
    .limit(perPage)
    .populate('categories')
    .populate('author')
    .exec()
    .then((posts) => {
        res.render('admin/post-list', {
            title: 'All posts',
            section: "post",
            posts: posts,
        })
    })
    .catch((err) => {
        console.error(err)
        res.render('admin/error', {
            title: 'Error',
            message: 'Error 500'
        })
    })
})
.get('/new', (req, res, next) => {
    Promise.all([
        User.find({}).exec(),
        PostCategory.find({}).exec(),
    ])
    .then(([users, postCategories]) => {
        res.render('admin/post-edit', {
            title: `Create a new post`,
            section: "post",
            post: {
                author: {},
                categories: [],
                publishedAt: Date.now(),
            },
            postCategories,
            users,
        })
    })
    .catch((err) => {
        console.error(err)
        res.render('admin/error', {
            title: 'Error',
            error: 'Error 500',
        })
    })
})
.post('/new', (req, res, next) => {
    req.body.publishedAt = new Date(req.body.publishedAt).getTime()
    Post.create({
        title: req.body.title,
        slug: req.body.slug,
        image: req.body.image,
        description: req.body.description,
        author: req.body.author,
        content: req.body.content,
        publishedAt: req.body.publishedAt,
        isPublished: req.body.isPublished,
        categories: req.body.categories,
    })
    .then((post) => {
        req.flash('success', `Post '${post.title}' has been created successfully`)
        res.redirect('/admin/post/all')
    })
    .catch((err) => {
        console.error(err)
        req.flash('error', err.message)
        res.redirect('/admin/post/new')
    })
})
.post('/remove', (req, res, next) => {
    Post.findByIdAndRemove(req.body._id)
    .then((removedPost) => {
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
                message: 'Post could not found',
            })
        }
    })
    .catch((err) => {
        console.error(err)
        res.json({
            status: 'error',
            code: 500,
            message: err.message
        })
    })
})
.get('/:postId', (req, res, next) => {
    Promise.all([
        Post.findById(req.params.postId).exec(),
        User.find({}).exec(),
        PostCategory.find({}).exec(),
    ])
    .then(([post, users, postCategories]) => {
        res.render('admin/post-edit', {
            title: `Edit post "${post.title}"`,
            section: "post",
            post,
            postCategories,
            users,
        })
    })
    .catch((err) => {
        console.error(err)
        res.render('admin/error', {
            title: 'Error',
            error: 'Error 500',
        })
    })
})
.post('/:postId', (req, res, next) => {
    req.body._id = req.params.postId
    req.body.publishedAt = new Date(req.body.publishedAt).getTime()
    Post.findByIdAndUpdate(req.params.postId, {
        title: req.body.title,
        slug: req.body.slug,
        image: req.body.image,
        description: req.body.description,
        author: req.body.author,
        content: req.body.content,
        publishedAt: req.body.publishedAt,
        isPublished: req.body.isPublished,
        categories: req.body.categories,
    }, {
        runValidators: true,
    }).then(() => {
        req.flash('success', `Post '${req.body.title}' has been updated successfully`)
        res.redirect(`/admin/post/${req.params.postId}`)
    }).catch((err) => {
        console.error(err)
        req.flash('error', err.message)
        res.redirect(`/admin/post/${req.params.postId}`)
    })
})
