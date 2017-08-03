import { Router } from 'express'
import Post from '../models/Post'

const router = Router()

router.get('/:postSlug', (req, res, next) => {
    Post.findOne({slug: req.params.postSlug})
    .populate('categories')
    .populate('author')
    .exec()
    .then((post) => {
        if (post) {
            return res.render('home/post', {
                title: post.title,
                post,
            })
        }
        // TODO: Render 'post not found' page
        return next()
    })
    .catch(next)
})

export default router
