import { Router } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as userPromises from '../../promises/user'
import * as postCategoryPromises from '../../promises/postCategory'
import * as postPromises from '../../promises/post'

const router = Router()

const onApiSuccess = (res) => ((result) => {
    if (result) {
        res.status(200).json(result)
    } else {
        res.status(404).send()
    }
})

const onApiError = (res) => ((err) => {
    console.error(err)
    res.status(500).send()
})

router.use(bodyParser.json())
    .use(cors())
    // /user route
    .get('/user/:userId', function(req, res, next) {
        userPromises.getUserById(req.params.userId)
            .then(onApiSuccess(res))
            .catch(onApiError(res))
    })
    // /post route
    .get('/post/category/:catId', function(req, res, next) {
        postPromises.getPostsByCategory(req.params.catId)
            .then(onApiSuccess(res))
            .then(onApiError(res))
    })
    .get('/post/:postSlug', function(req, res, next) {
        postPromises.getPostBySlug(req.params.postSlug)
            .then(onApiSuccess(res))
            .catch(onApiError(res))
    })
    // /category route
    .get('/category/:catSlug', function(req, res, next) {
        postCategoryPromises.getPostCategoryBySlug(req.params.catSlug)
            .then(onApiSuccess(res))
            .catch(onApiError(res))
    })

export default router
