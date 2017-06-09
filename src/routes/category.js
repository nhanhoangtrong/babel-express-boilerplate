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
            _csrf: req.csrfToken,
            postCategory: postCategory,
            posts: posts
        })
    }).catch(function(err) {
        console.error(err)
        res.render('home/error', {
            _csrf: req.csrfToken,
            title: 'Error 500',
            message: err.message
        })
    })
})

export default router
