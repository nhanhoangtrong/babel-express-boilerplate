import { Router } from 'express'
import { getPostCategoryBySlug } from '../promises/postCategory'
import { getPostsByCategory } from '../promises/post'

const router = Router()

router.get('/:catSlug', function(req, res, next) {
    let postCategory
    getPostCategoryBySlug(req.params.catSlug).then(function(cat) {
        postCategory = cat
        return getPostsByCategory(cat._id)
    }).then(function(posts) {
        res.render('home/category', {
            title: postCategory.name,
            postCategory: postCategory,
            posts: posts
        })
    }).catch(function(err) {
        console.error(err)
        res.render('home/error', {
            title: 'Error 500',
            message: err.message
        })
    })
})

export default router
