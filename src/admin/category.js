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
        res.status(err.statusCode || 500).render('admin/category-edit', {
            title: 'Create a new Post Category',
            postCategory: {
                name: req.body.name,
                slug: req.body.slug,
                description: req.body.description,
            },
        });
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
        const err = new Error('Local File was not found');
        err.statusCode = 400;
        err.name = 'BadRequest';
        throw err;

    } catch (err) {
        res.status(err.statusCode || 500).json({
            status: 'error',
            code: err.statusCode || 500,
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
        res.status(err.statusCode || 500).render('admin/category-edit', {
            title: `Edit "${req.body.name}" category`,
            postCategory: {
                name: req.body.name,
                slug: req.body.slug,
                description: req.body.description,
            },
        });
    }
});

export default router;
