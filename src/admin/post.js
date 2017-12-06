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
}).get('/', async (req, res, next) => {
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    let perPage = parseInt(req.query.per, 10);
    if (isNaN(perPage) || perPage < 1) {
        perPage = 20;
    }
    try {
        const posts = await Post.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('categories')
            .populate('author')
            .exec();
        const total = await Post.find({}).count().exec();

        res.render('admin/posts-list', {
            title: 'All posts',
            posts: posts,
            totalPages: Math.ceil(total / perPage),
            currentPage: page,
            perPage,
        });
    } catch (err) {
        next(err);
    }
}).get('/new', async (req, res, next) => {
    try {
        const [users, postCategories] = await Promise.all([
            User.find({}).exec(),
            PostCategory.find({}).exec(),
        ]);
        const defaultPostCategory = postCategories.filter(c => c.default)[0];
        res.render('admin/post-edit', {
            title: `Create a new post`,
            post: {
                author: {},
                categories: [],
                publishedAt: Date.now(),
            },
            postCategories,
            defaultPostCategory,
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
        res.redirect('/admin/post');
    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.status(err.statusCode || 500).render('admin/post-edit', {
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
        return next(err);
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
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.status(err.statusCode || 500).render('admin/post-edit', {
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
