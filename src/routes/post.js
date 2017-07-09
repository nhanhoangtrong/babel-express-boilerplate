import { Router } from 'express'
import * as postPromises from '../promises/post'

const router = Router()

router.get('/:postSlug', function(req, res, next) {
    postPromises.getPostBySlug(req.params.postSlug)
        .then(function(post) {
            if (post) {
                res.render('home/post', {
                    title: post.title,
                    post: post,
                })
            } else {
                res.render('home/error', {
                    title: 'Error 404',
                    message: 'Page not found',
                })
            }
        })
})

export default router
