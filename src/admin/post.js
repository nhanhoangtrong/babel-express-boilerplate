/* eslint-disable no-undef */
import { Router } from 'express';
import logger from '../logger';

import {
    User,
    Post,
    PostCategory,
 } from '../models';

const router = Router();
/**
 * Posts section
 */
router.use((req, res, next) => {
    res.locals.section = 'post';
    next();
}).get('/all', async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 0;
    const perPage = parseInt(req.query.per, 10) || 20;
    try {
        const posts = await Post.find({})
            .skip(page * perPage)
            .limit(perPage)
            .populate('categories')
            .populate('author')
            .exec();
        const total = await Post.find({}).count().exec();

        res.render('admin/post-list', {
            title: 'All posts',
            posts: posts,
            nPages: Math.ceil(total / perPage),
        });
    } catch (err) {
        next(err);
    }
}).get('/new', async (req, res, next) => {
    try {
        const [users, postCategories] = Promise.all([
            User.find({}).exec(),
            PostCategory.find({}).exec(),
        ]);
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
    } catch (err) {
        next(err);
    }

}).post('/new', async (req, res, next) => {
    try {
        req.body.publishedAt = new Date(req.body.publishedAt).getTime();
        const post = await Post.create({
            title: req.body.title,
            slug: req.body.slug,
            image: req.body.image,
            description: req.body.description,
            author: req.body.author,
            content: req.body.content,
            publishedAt: req.body.publishedAt,
            isPublished: req.body.isPublished,
            categories: req.body.categories,
        });

        req.flash('success', `Post '${post.title}' has been created successfully`);
        res.redirect('/admin/post/all');
    } catch (err) {
        logger.error(JSON.stringify(err, null, 2));
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
            },
        });
    }
}).post('/remove', async (req, res, next) => {
    try {
        const poremovedPostst = await Post.findByIdAndRemove(req.body._id).exec();
        if (removedPost) {
            return res.json({
                status: 'ok',
                code: 200,
                message: `Post ${removedPost.title} has been removed successfully!`,
            });
        }
        return res.json({
            status: 'error',
            code: 400,
            message: 'Post could not found',
        });
    } catch (err) {
        logger.error(JSON.stringify(err, null, 2));
        res.json({
            status: 'error',
            code: 500,
            message: err.message
        });
    }
}).get('/:postId', async (req, res, next) => {
    try {
        const [post, users, postCategories] = await Promise.all([
            Post.findById(req.params.postId).exec(),
            User.find({}).exec(),
            PostCategory.find({}).exec(),
        ]);
        if (post) {
            return res.render('admin/post-edit', {
                title: `Edit post "${post.title}"`,
                post,
                postCategories,
                users,
            });
        }
        return next();
    } catch (err) {
        next(err);
    }
}).post('/:postId', async (req, res, next) => {
    try {
        req.body._id = req.params.postId;
        req.body.publishedAt = new Date(req.body.publishedAt).getTime();
        const raw = await Post.findByIdAndUpdate(req.params.postId, {
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
        }).exec();

        req.flash('success', `Post '${req.body.title}' has been updated successfully`);
        res.redirect(`/admin/post/${req.params.postId}`);

    } catch (err) {
        logger.error(JSON.stringify(err, null, 2));
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.render('admin/post-edit', {
            title: `Edit post "${req.body.title}"`,
            post: {
                _id: req.body.postId,
                title: req.body.title,
                slug: req.body.slug,
                image: req.body.image,
                description: req.body.description,
                author: req.body.author,
                content: req.body.content,
                publishedAt: req.body.publishedAt,
                isPublished: req.body.isPublished,
                categories: req.body.categories,
            },
        });
    }
});

export default router;
