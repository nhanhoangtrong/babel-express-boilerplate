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
        const page = req.query.page || 1;
        const perPage = req.query.per || 5;
        const postCategory = await PostCategory.findOne({ slug: req.params.catSlug }).exec();

        if (!postCategory) {
            // TODO: render 'category' not found page
            return next();
        }

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
        });

    } catch (err) {
        return next(err);
    }
});

export default router;
