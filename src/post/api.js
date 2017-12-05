import {
    Router
} from 'express';

import { Post, PostCategory } from '../models';

const availableFields = {
    __v: 0,
};

export const postApi = Router()
    .get('/', (req, res, next) => {
        Post
            .find({})
            .select(availableFields)
            .exec()
            .then((posts) => {
                res.json(posts);
            })
            .catch(next);
    })
    .get('/:id', (req, res, next) => {
        Post.findById(req.params.id)
            .select(availableFields)
            .exec()
            .then((post) => {
                if (post) {
                    return res.json(post);
                }
                return next();
            })
            .catch((err) => {
                if (err.name && err.name === 'CastError') {
                    return next();
                }
                return next(err);
            });
    });

export const postCategoryApi = Router()
    .get('/', (req, res, next) => {
        PostCategory.find({})
            .select(availableFields)
            .exec()
            .then((postCategories) => {
                res.json(postCategories);
            })
            .catch(next);
    })
    .get('/:id', (req, res, next) => {
        PostCategory
            .findById(req.params.id)
            .select(availableFields)
            .exec()
            .then((postCategory) => {
                if (postCategory) {
                    return res.json(postCategory);
                }
                return next();
            })
            .catch(next);
    });
