import { Router } from 'express'

import PostCategory from '../../models/PostCategory'

const availableFields = {
    __v: 0,
}

export default Router()
.get('/', (req, res, next) => {
    PostCategory.find({})
    .select(availableFields)
    .exec()
    .then((postCategories) => {
        res.json(postCategories)
    })
    .catch(next)
})
.get('/:id', (req, res, next) => {
    PostCategory
    .findById(req.params.id)
    .select(availableFields)
    .exec()
    .then((postCategory) => {
        if (postCategory) {
            return res.json(postCategory)
        }
        return next()
    })
    .catch(next)
})
