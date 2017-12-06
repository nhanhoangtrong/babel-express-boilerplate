/* eslint-disable no-undef */
import { Router } from 'express';
import passport from 'passport';
import logger from '../logger';
import { isAuthenticated } from '../auth/middlewares';
import { User } from '../models';

const router = Router();

router.use(isAuthenticated({
    redirectUrl: req => `/login?ref=${req.originalUrl}`,
    failOnError: false,
}))
.get('/', (req, res) => {
    res.render('home/account', {
        title: 'Account',
        user: req.user,
    });
})
.post('/', async (req, res, next) => {
    req.body._id = req.user._id;
    try {
        if (req.body.password) {
            // User is going to change password
            if (req.body.password !== req.body.repassword) {
                const err = new Error('Re-type password was not matched.');
                err.statusCode = 400;
                throw err;
            }
            const user = await User.findByIdAndUpdate(req.body._id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: req.body.password,
            }).exec();

            req.flash('success', 'User profile and password have been updated successfully!');
            res.redirect('/account');
        } else {
            // User will not change password
            const user = User.findByIdAndUpdate(req.body._id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            }).exec();

            req.flash('success', 'User profile has been updated successfully!');
            res.redirect('/account');
        }
    } catch (err) {
        req.flash('error', err.message);
        res.status(err.statusCode || 500).render('home/account', {
            title: 'Account',
            user: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            }
        });
        next(err);
    }
});

export default router;
