import { Router } from 'express';
import logger from '../logger';

import { Post, User } from '../models';

const router = Router();
/**
 * User section
 */
router.use((req, res, next) => {
    res.locals.section = 'users';
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
        const users = await User.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const total = await User.find({}).count().exec();

        res.render('admin/users-list', {
            title: 'All Users',
            users: users,
            totalPages: Math.ceil(total / perPage),
            currentPage: page,
            perPage,
        });
    } catch (err) {
        next(err);
    }
}).get('/new', (req, res, next) => {
    res.render('admin/user-edit', {
        title: `Creating a new user`,
        section: 'users',
        edittedUser: {
            createdAt: new Date(),
        },
    });
}).post('/new', async (req, res, next) => {
    try {
        if (req.body.password !== req.body.repassword) {
            throw new Error('Re-type password does not match.');
        }

        req.body.createdAt = new Date(req.body.createdAt);

        const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin,
            createdAt: req.body.createdAt,
        });
        req.flash('success', `User ${user.firstName} has been created successfully.`);
        res.redirect('/admin/user');
    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.status(err.statusCode || 500).render('admin/user-edit', {
            title: `Creating a new user`,
            edittedUser: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                createdAt: req.body.createdAt,
                isAdmin: req.body.isAdmin,
            },
        });
    }
}).get('/:userId', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId).exec();
        if (user) {
            return res.render('admin/user-edit', {
                title: `Editing user "${user.firstName} ${user.lastName}"`,
                edittedUser: user,
            });
        }
        return next();
    } catch (err) {
        return next(err);
    }
}).post('/:userId', async (req, res, next) => {
    try {
        req.body.createdAt = new Date(req.body.createdAt);
        const user = await User.findByIdAndUpdate(req.params.userId, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin,
            createdAt: req.body.createdAt,
        }).exec();

        req.flash('success', `User "${user.firstName} ${user.lastName}" has been updated successfully.`);
        res.redirect('/admin/user');
    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.status(err.statusCode || 500).render('admin/user-edit', {
            title: `Editing user ${req.body.firstName} ${req.body.lastName}`,
            edittedUser: {
                _id: req.params.userId,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                createdAt: req.body.createdAt,
                isAdmin: req.body.isAdmin,
            },
        });
    }
});

export default router;
