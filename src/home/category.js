import { Router } from 'express';
import { Post, PostCategory} from '../models';

const router = Router();

router.get('/:catSlug', (req, res, next) => {
    const page = req.query.page || 0;
    const perPage = req.query.per || 5;
    let postCategory;
    PostCategory.findOne({slug: req.params.catSlug}).exec()
    .then((cat) => {
        if (cat) {
            postCategory = cat;
            return Post.find({categories: cat._id})
                .populate('categories')
                .populate('author')
                .skip(page * perPage)
                .limit(perPage)
                .exec()
                .then((posts) => {
                    res.render('home/category', {
                        title: postCategory.name,
                        postCategory,
                        posts,
                    });
                });
        }
        // TODO: render 'category' not found page
        return next();
    })
    .catch(next);
});

export default router;
