import { Router } from 'express';
import { Post, PostCategory} from '../models';

const router = Router();

router
.get('/', async (req, res, next) => {
    try {
        const postCategories = await PostCategory.find({}).exec();
        res.render('home/categories-list', {
            postCategories,
        });
    } catch (err) {
        next(err);
    }
})
.get('/:catSlug', async (req, res, next) => {
    try {
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        let perPage = parseInt(req.query.per, 10);
        if (isNaN(perPage) || perPage < 1) {
            perPage = 5;
        }
        const postCategory = await PostCategory.findOne({ slug: req.params.catSlug }).exec();

        if (!postCategory) {
            // TODO: render 'category' not found page
            return next();
        }

        const total = await Post.find({
            categories: postCategory._id,
            isPublished: true,
        }).count().exec();
        const posts = await Post.find({
            categories: postCategory._id,
            isPublished: true,
        }).populate('categories')
            .populate('author')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        return res.render('home/category', {
            title: postCategory.name,
            postCategory,
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / perPage),
            paginationPath: `/category/${postCategory.slug}`,
        });

    } catch (err) {
        return next(err);
    }
});

export default router;
