import { Router } from 'express'
import * as categoryPromises from '../../promises/postCategory'
import { removeCategoryFromPosts } from '../../promises/post'

const router = Router()

router
/**
 * PostCategory section
 */
.get('/all', function(req, res, next) {
    categoryPromises.getAllPostCategories()
        .then(function(postCategories) {
            res.render('admin/category-list', {
                title: `All Post Categories`,
                section: "category",
                postCategories,
            })
        }).catch(function(err) {
            console.error(err)
            res.render('admin/error', {
                title: 'Error',
                error: 'Error 500',
            })
        })
})
.get('/new', function(req, res, next) {
    res.render('admin/category-edit', {
        title: 'Create a new Post category',
        section: "category",
        postCategory: {},
    })
})
.post('/new', function(req, res, next) {
    categoryPromises.postNewPostCategory(req.body)
        .then(function(postCategory) {
            req.flash('success', `Category ${postCategory.name} has been created successfully`)
            res.redirect('/admin/category/all')
        }).catch(function(err) {
            console.error(err)
            req.flash('error', `${err.message}`)
            res.redirect('/admin/category/new')
        })
})
.post('/remove', function(req, res, next) {
    const catId = req.body._id
    Promise.all([categoryPromises.removePostCategory(catId), removeCategoryFromPosts(catId)])
        .then(function(args) {
            const removedCategory = args[0]
            if (removedCategory) {
                res.json({
                    status: 'ok',
                    code: 200,
                    message: `Category '${removedCategory.name}' has been removed successfully!`,
                })
            } else {
                res.json({
                    status: 'error',
                    code: 404,
                    message: 'Category was not found!',
                })
            }
        }).catch(function(err) {
            res.json({
                status: 'error',
                code: 500,
                message: err.message,
            })
        })
})
.get('/:catId', function(req, res, next) {
    categoryPromises.getPostCategoryById(req.params.catId)
        .then(function(postCategory) {
            res.render('admin/category-edit', {
                title: `Edit "${postCategory.name}" category`,
                section: "category",
                postCategory,
            })
        })
})
.post('/:catId', function(req, res, next) {
    req.body._id = req.params.catId
    console.log(req.body)
    categoryPromises.updatePostCategory(req.body)
        .then(function() {
            req.flash('success', `Category ${req.body.name} has been updated successfully`)
            res.redirect('/admin/category/all')
        }).catch(function(err) {
            console.error(err)
            req.flash('error', `${err.message}`)
            res.redirect('/admin/category/' + req.params.catId)
        })
})

export default router
