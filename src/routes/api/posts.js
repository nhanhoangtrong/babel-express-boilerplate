import { Router } from 'express'

import Post from '../../models/Post'

const availableFields = {
    __v: 0,
}

export default Router()
.get('/', (req, res, next) => {
    Post
    .find({})
    .select(availableFields)
    .exec()
    .then((posts) => {
        res.json(posts)
    })
    .catch(next)
})
.get('/:id', (req, res, next) => {
    Post.findById(req.params.id)
    .select(availableFields)
    .exec()
    .then((post) => {
        if (post) {
            return res.json(post)
        }
        return next()
    })
    .catch((err) => {
        if (err.name && err.name === 'CastError') {
            return next()
        }
        return next(err)
    })
})
.get('/:slug', (req, res, next) => {
    Post.findOne({slug: req.params.slug})
    .select(availableFields)
    .exec()
    .then((post) => {
        if (post) {
            return res.json(post)
        }
        return next()
    })
    .catch(next)
})
