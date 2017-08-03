import { Router } from 'express'
import winston from 'winston'
import bodyParser from 'body-parser'
import cors from 'cors'

import User from '../../models/User'
import PostCategory from '../../models/PostCategory'
import Post from '../../models/Post'

const onApiSuccess = (req, res, next) => (obj) => {
    if (obj) {
        return res.status(200).json({
            data: obj,
        })
    }
    return next()
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
// Handle not found error
.use((req, res, next) => {
    return res.status(404).send({
        message: 'Route not found',
    })
})
.use((err, req, res, next) => {
    // Check the environment
    if (process.env.NODE_ENV === 'development') {
        return next(err)
    }
    winston.error('%j', err)
    delete err.stack
    return res.status(500).send({
        message: err.message,
        error: err,
    })
})
