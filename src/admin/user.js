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
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const perPage = parseInt(req.query.per, 10) || 20;
        const users = await User.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const total = await User.find({}).count().exec();

        res.render('admin/user-list', {
            title: 'All Users',
            users: users,
            totalPages: Math.ceil(total / perPage),
            currentPage: page,
        });
    } catch (err) {
        next(err);
    }
}).get('/new', (req, res, next) => {
    res.render('admin/user-edit', {
        title: `Creating a new user`,
        section: 'users',
        edittedUser: {
            createdAt: Date.now(),
        },
    });
}).post('/new', async (req, res, next) => {
    try {
        if (req.body.password !== req.body.repassword) {
            throw new Error('Re-type password does not match.');
        }

        const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin,
            createdAt: new Date(req.body.createdAt).getTime(),
        });
        req.flash('success', `User ${user.firstName} has been created successfully.`);
        res.redirect('/admin/user');
    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.status(500).render('admin/user-edit', {
            title: `Creating a new user`,
            edittedUser: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                createdAt: new Date(req.body.createdAt).getTime(),
                isAdmin: req.body.isAdmin,
            },
        });
        next(err);
    }
})
// AJAX remove route
.post('/remove', async (req, res, next) => {
    try {
        const userId = req.body._id;
        const removedUser = await User.findByIdAndRemove(userId).exec();
        const raw = await Post.deleteMany({ author: userId }).exec();
        if (removedUser) {
            res.json({
                status: 'ok',
                code: 200,
                message: `User '${removedUser.firstName} ${removedUser.lastName}' has been removed successfully.`,
            });
        } else {
            res.status(400).json({
                status: 'error',
                code: 400,
                name: 'Bad Request',
                message: 'User was not found.',
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'error',
            code: 500,
            name: err.name,
            message: err.message,
        });
        next(err);
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
        req.body.createdAt = new Date(req.body.createdAt).getTime();
        const user = await User.findByIdAndUpdate(req.params.userId, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin,
        }).exec();

        req.flash('success', `User "${user.firstName} ${user.lastName}" has been updated successfully.`);
        res.redirect('/admin/user');
    } catch (err) {
        req.flash('error', err.message);
        // TODO: pass error value into render file
        res.status(500).render('admin/user-edit', {
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
        next(err);
    }
});

export default router;
