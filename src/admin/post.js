/* eslint-disable no-undef */
import { Router } from 'express';
import logger from '../logger';

import {
    User,
    Post,
    PostCategory,
 } from '../models';

export default Router()
/**
 * Posts section
 */
.use((req, res, next) => {
    res.locals.section = 'post';
    next();
})
.get('/all', (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 0;
    const perPage = parseInt(req.query.per, 10) || 20;
    Post.find({})
    .skip(page * perPage)
    .limit(perPage)
    .populate('categories')
    .populate('author')
    .exec()
    .then((posts) => {
        res.render('admin/post-list', {
            title: 'All posts',
            posts: posts,
        });
    })
    .catch(next);
})
.get('/new', (req, res, next) => {
    Promise.all([
        User.find({}).exec(),
        PostCategory.find({}).exec(),
    ])
    .then(([users, postCategories]) => {
        res.render('admin/post-edit', {
            title: `Create a new post`,
            post: {
                author: {},
                categories: [],
                publishedAt: Date.now(),
            },
            postCategories,
            users,
        });
    })
    .catch(next);
})
.post('/new', (req, res, next) => {
    req.body.publishedAt = new Date(req.body.publishedAt).getTime();
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
        req.flash('success', `Post '${post.title}' has been created successfully`);
        res.redirect('/admin/post/all');
    })
    .catch((err) => {
        logger.error('%j', err);
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.render('admin/post-edit', {
            title: `Create a new post`,
            post: {
                title: req.body.title,
                slug: req.body.slug,
                image: req.body.image,
                description: req.body.description,
                author: req.body.author,
                content: req.body.content,
                publishedAt: req.body.publishedAt,
                isPublished: req.body.isPublished,
                categories: req.body.categories,
            }
        });
    });
})
.post('/remove', (req, res, next) => {
    Post.findByIdAndRemove(req.body._id)
    .then((removedPost) => {
        if (removedPost) {
            return res.json({
                status: 'ok',
                code: 200,
                message: `Post ${removedPost.title} has been removed successfully!`,
            });
        }
        return res.json({
            status: 'error',
            code: 404,
            message: 'Post could not found',
        });
    })
    .catch((err) => {
        logger.error('%j', err);
        res.json({
            status: 'error',
            code: 500,
            message: err.message
        });
    });
})
.get('/:postId', (req, res, next) => {
    Promise.all([
        Post.findById(req.params.postId).exec(),
        User.find({}).exec(),
        PostCategory.find({}).exec(),
    ])
    .then(([post, users, postCategories]) => {
        if (post) {
            return res.render('admin/post-edit', {
                title: `Edit post "${post.title}"`,
                post,
                postCategories,
                users,
            });
        }
        return next();
    })
    .catch(next);
})
.post('/:postId', (req, res, next) => {
    req.body._id = req.params.postId;
    req.body.publishedAt = new Date(req.body.publishedAt).getTime();
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
        req.flash('success', `Post '${req.body.title}' has been updated successfully`);
        res.redirect(`/admin/post/${req.params.postId}`);
    }).catch((err) => {
        logger.error('%j', err);
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.render('admin/post-edit', {
            title: `Create a new post`,
            post: {
                title: req.body.title,
                slug: req.body.slug,
                image: req.body.image,
                description: req.body.description,
                author: req.body.author,
                content: req.body.content,
                publishedAt: req.body.publishedAt,
                isPublished: req.body.isPublished,
                categories: req.body.categories,
            }
        });
    });
});
