import { Router } from 'express';
import { Post } from '../models';

const router = Router();

router.get('/:postSlug', async (req, res, next) => {
    try {
        const post = await Post.findOne({slug: req.params.postSlug, isPublished: true})
            .populate('categories')
            .populate('author')
            .exec();
        if (post) {
            return res.render('home/post', {
                title: post.title,
                post,
            });
        }

        // TODO: Render 'post not found' page
        return next();
    } catch (err) {
        return next(err);
    }
});

export default router;
