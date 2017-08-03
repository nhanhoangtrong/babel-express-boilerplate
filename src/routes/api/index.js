import { Router } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import User from '../../models/User'
import PostCategory from '../../models/PostCategory'
import Post from '../../models/Post'

class NotFound extends Error {
    constructor() {
        super('Not Found')
        this.statusCode = 404
    }
}

const onApiSuccess = (req, res, next) => (obj) => {
    if (obj) {
        return res.json({
            data: obj,
        })
    }
    return next(new NotFound())
}

export default Router()
.use(bodyParser.json())
.use(cors())
// /user route
.get('/user/:userId', (req, res, next) => {
    User.findById(req.params.userId).exec()
    .then(onApiSuccess(req, res, next))
    .catch(next)
})
// /category route
.get('/category/:catId', (req, res, next) => {
    PostCategory.findById(req.params.catId).exec()
    .then(onApiSuccess(req, res, next))
    .then(next)
})
// /post route
.get('/post/:postId', (req, res, next) => {
    Post.findById(req.params.postId).exec()
    .then(onApiSuccess(req, res, next))
    .catch(next)
})
.use((err, req, res, next) => {
    if (err.statusCode === 404) {
        return res.status(404).send({
            message: err.message,
        })
    }
    return res.status(500).send({
        message: err.message,
    })
})
