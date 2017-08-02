import { Router } from 'express'
import Post from '../models/Post'
import PostCategory from '../models/PostCategory'

const router = Router()

router.get('/:catSlug', (req, res, next) => {
    let postCategory
    PostCategory.findOne({slug: req.params.catSlug}).exec()
    .then((cat) => {
        postCategory = cat
        return Post.find({categories: cat._id}).exec()
    })
    .then((posts) => {
        res.render('home/category', {
            title: postCategory.name,
            postCategory,
            posts,
        })
    })
    .catch((err) => {
        console.error(err)
        res.render('home/error', {
            title: 'Error 500',
            message: err.message,
            error: err,
        })
    })
})

export default router
