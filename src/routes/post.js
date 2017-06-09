import { Router } from 'express'
import * as postPromises from '../promises/post'

const router = Router()

router.get('/:postSlug', function(req, res, next) {
    postPromises.getPostBySlug(req.params.postSlug)
        .then(function(post) {
            if (post) {
                res.render('home/post', {
                    title: post.title,
                    _csrf: req.csrfToken,
                    post: post,
                })
            } else {
                res.render('home/error', {
                    title: 'Error 404',
                    _csrf: req.csrfToken,
                    message: 'Page not found',
                })
            }
        })
})

export default router
