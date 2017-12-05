import { Router } from 'express';
import passport from 'passport';
import { User } from '../models';

export const authRoute = Router();

authRoute.route('/')
    .get((req, res) => {
        if (req.user) {
            return res.json({
                message: 'Authenticated.',
            });
        }
        return res.json({
            message: 'Unauthenticated.',
        });
    })
    .post((req, res, next) => {
        passport.authenticate('local', {}, (err, user) => {
            if (err) {
                return next(err);
            }
            return res.json({
                ...user,
            });
        });
    });

const availableFields = {
    hashedPassword: 0,
    salt: 0,
    __v: 0,
};

export const userRoute = Router();
userRoute
    .get('/', (req, res, next) => {
        User
            .find({})
            .select(availableFields)
            .exec()
            .then((users) => {
                res.json(users);
            })
            .catch(next);
    })
    .get('/:id', (req, res, next) => {
        User.findById(req.params.id)
            .select(availableFields)
            .exec()
            .then((user) => {
                if (user) {
                    return res.json(user);
                }
                return next();
            })
            .catch((err) => {
                if (err.name === 'CastError') {
                    return next();
                }
                return next(err);
            });
    });
