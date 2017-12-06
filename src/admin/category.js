import { Router } from 'express';
import logger from '../logger';

import { Post, PostCategory } from '../models';

const router = Router();
/**
 * PostCategory section
 */
router.use((req, res, next) => {
    res.locals.section = 'category';
    next();
})
.get('/', async (req, res, next) => {
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    let perPage = parseInt(req.query.per, 10);
    if (isNaN(perPage) || perPage < 1) {
        perPage = 10;
    }

    try {
        const total = await PostCategory.count().exec();
        const totalPages = Math.ceil(total / perPage);
        const postCategories = await PostCategory.find({}).skip((page - 1) * perPage).limit(perPage).exec();

        return res.render('admin/categories-list', {
            title: `All Post Categories`,
            postCategories,
            currentPage: page,
            totalPages,
            perPage,
        });
    } catch (err) {
        return next(err);
    }
})
.get('/new', (req, res) => {
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

        req.flash('success', `Category ${postCategory.name} has been created successfully.`);
        res.redirect('/admin/category');

    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.render('admin/category-edit', {
            title: 'Create a new Post Category',
            postCategory: {
                name: req.body.name,
                slug: req.body.slug,
                description: req.body.description,
            },
        });

        next(err);
    }
})
// AJAX remove route
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

            return res.json({
                status: 'ok',
                code: 200,
                message: `Category '${removedCategory.name}' has been removed successfully.`,
            });
        }
        return res.status(400).json({
            status: 'error',
            code: 400,
            name: 'Bad Request',
            message: 'Category not found or cannot be removed.',
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            code: 500,
            name: err.name,
            message: err.message,
        });
        return next(err);
    }
})
// AJAX edit route
.post('/edit', async (req, res, next) => {
    try {
        const postCategory = await PostCategory.findByIdAndUpdate(req.body._id, {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
        }, {
            runValidators: true,
        }).exec();

        if (postCategory) {
            return res.json({
                status: 'ok',
                code: 200,
                message: 'Post Category has been updated successfully.',
                data: {
                    postCategory,
                },
            });
        }
        return res.status(400).json({
            status: 'error',
            code: 400,
            name: 'Bad Request',
            message: 'Category was not found.',
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            code: 500,
            name: err.name,
            message: err.message,
        });
        return next(err);
    }
})
.get('/:catId', async (req, res, next) => {
    try {
        const postCategory = await PostCategory.findById(req.params.catId).exec();
        if (postCategory) {
            return res.render('admin/category-edit', {
                title: `Edit "${postCategory.name}" category`,
                postCategory,
            });
        }
        return next();
    } catch (err) {
        return next(err);
    }
})
.post('/:catId', async (req, res, next) => {
    try {
        req.body._id = req.params.catId;
        const postCategory = await PostCategory.findByIdAndUpdate(req.body._id, {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
        }, { runValidators: true }).exec();

        req.flash('success', `Category ${postCategory.name} has been updated successfully.`);
        res.redirect('/admin/category');
    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.render('admin/category-edit', {
            title: `Edit "${req.body.name}" category`,
            postCategory: {
                name: req.body.name,
                slug: req.body.slug,
                description: req.body.description,
            },
        });
        next(err);
    }
});

export default router;
