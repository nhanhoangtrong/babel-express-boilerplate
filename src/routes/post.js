import { Router } from 'express'
import Post from '../models/Post'

const router = Router()

router.get('/:postSlug', (req, res, next) => {
    Post.findOne({slug: req.params.postSlug})
    .exec()
    .then((post) => {
        if (post) {
            return res.render('home/post', {
                title: post.title,
                post,
            })
        }
        return res.render('home/error', {
            title: 'Error 404',
            message: 'Page not found',
        })
    })
    .catch((err) => {
        console.error(err)
        res.render('home/error', {
            title: 'Error 500',
            error: err,
            message: err.message,
        })
    })
})

export default router
