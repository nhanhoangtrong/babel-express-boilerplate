import { Router } from 'express';
import logger from '../logger';

import { Post, PostCategory } from '../models';

export default Router()
    /**
     * PostCategory section
     */
    .use((req, res, next) => {
        res.locals.section = 'category';
        next();
    })
    .get('/all', async (req, res, next) => {
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.per, 10) || 20;

        try {
            const total = await PostCategory.count().exec();
            const nPages = Math.ceil(total / perPage);
            const postCategories = await PostCategory.find({}).skip((page - 1) * perPage).limit(perPage).exec();

            return res.render('admin/category-list', {
                title: `All Post Categories`,
                postCategories,
                currentPage: page,
                nPages,
            });
        } catch (err) {
            return next(err);
        }
    })
    .get('/new', (req, res, next) => {
        res.render('admin/category-edit', {
            title: 'Create a new Post Category',
            postCategory: {},
        });
    })
    .post('/new', async (req, res, next) => {
        try {
            const postCategory = await PostCategory.create({
                name: req.body.name,
                slug: req.body.slug,
                description: req.body.description,
            });

            req.flash('success', `Category ${postCategory.name} has been created successfully`);
            res.redirect('/admin/category/all');
        } catch (err) {
            logger.error(`${JSON.stringify(err, null, 2)}`);
            req.flash('error', `${err.message}`);
            // TODO: pass error value into render file
            res.render('admin/category-edit', {
                title: 'Create a new Post Category',
                postCategory: {
                    name: req.body.name,
                    slug: req.body.slug,
                    description: req.body.description,
                },
            });
        }
    })
    .post('/remove', async (req, res, next) => {
        try {
            const removedCategory = await PostCategory.findOneAndRemove({
                _id: req.body._id,
                default: false,
            }).exec();

            if (removedCategory) {
                // Remove this PostCategory from posts
                const raw = await Post.updateMany({}, {
                    $pull: {
                        categories: req.body._id,
                    }
                }).exec();

                res.json({
                    status: 'ok',
                    code: 200,
                    message: `Category '${removedCategory.name}' has been removed successfully!`,
                });
            } else {
                res.json({
                    status: 'error',
                    code: 400,
                    message: 'Category cannot be removed!',
                });
            }
        } catch (err) {
            res.json({
                status: 'error',
                code: 500,
                message: err.message,
            });
        }
    })
    .post('/edit', (req, res, next) => {
        PostCategory.findByIdAndUpdate(req.body._id, {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
        }, {
            runValidators: true,
        })
        .exec()
        .then((postCategory) => {
            if (postCategory) {
                return res.json({
                    status: 'ok',
                    code: 200,
                    message: 'Post Category has been updated successfully',
                    data: {
                        postCategory: {
                            name: req.body.name,
                            slug: req.body.slug,
                            description: req.body.description,
                        },
                    },
                });
            }
            return res.json({
                status: 'error',
                code: 404,
                message: 'Post Category was not found',
            });
        })
        .catch((err) => {
            logger.error(err);
            res.json({
                status: 'error',
                code: 500,
                message: 'Internal Server Error',
            });
        });
    })
    .get('/:catId', (req, res, next) => {
        PostCategory.findById(req.params.catId).exec()
        .then((postCategory) => {
            if (postCategory) {
                return res.render('admin/category-edit', {
                    title: `Edit "${postCategory.name}" category`,
                    postCategory,
                });
            }
            return next();
        })
        .catch(next);
    })
    .post('/:catId', (req, res) => {
        req.body._id = req.params.catId;
        PostCategory.findByIdAndUpdate(req.body._id, {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
        }, {
            runValidators: true,
        })
        .then((postCategory) => {
            req.flash('success', `Category ${postCategory.name} has been updated successfully`);
            res.redirect('/admin/category/all');
        })
        .catch((err) => {
            logger.error('%j', err);
            req.flash('error', `${err.message}`);
            // TODO: pass error value into render file
            res.render('admin/category-edit', {
                title: `Edit "${req.body.name}" category`,
                postCategory: {
                    name: req.body.name,
                    slug: req.body.slug,
                    description: req.body.description,
                },
            });
        });
    });
