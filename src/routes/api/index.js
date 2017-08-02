import { Router } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import User from '../../models/User'
import PostCategory from '../../models/PostCategory'
import Post from '../../models/Post'

const onApiSuccess = (res) => (result) => {
    if (result) {
        res.status(200).json(result)
    } else {
        res.status(404).send()
    }
}

const onApiError = (res) => (err) => {
    console.error(err)
    res.status(500).send()
}

export default Router()
.use(bodyParser.json())
.use(cors())
// /user route
.get('/user/:userId', (req, res, next) => {
    User.findById(req.params.userId).exec()
    .then(onApiSuccess(res))
    .catch(onApiError(res))
})
// /category route
.get('/category/:catId', (req, res, next) => {
    PostCategory.findById(req.params.catId).exec()
    .then(onApiSuccess(res))
    .then(onApiError(res))
})
// /post route
.get('/post/:postId', (req, res, next) => {
    Post.findById(req.params.postId).exec()
    .then(onApiSuccess(res))
    .catch(onApiError(res))
})
