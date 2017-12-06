import { Router } from 'express';
import { PostCategory, Post, Enquiry, LocalFile, User } from '../../models';

import { unlinkSync } from 'fs';
import { join } from 'path';

const router = Router();

const modelMap = new Map([
    ['category', PostCategory],
    ['post', Post],
    ['enquiry', Enquiry],
    ['local-file', LocalFile],
    ['user', User],
]);

router.post('/:route/remove', async (req, res, next) => {
    try {
        if (!modelMap.has(req.params.route)) {
            const err = new Error('Route Not Found.');
            err.name = 'NotFound';
            err.statusCode = 404;
            throw err;
        }
        const Model = modelMap.get(req.params.route);
        const doc = await Model.findByIdAndRemove(req.body.objectId).exec();

        if (!doc) {
            const err = new Error('Object Not Found.');
            err.name = 'BadRequest';
            err.statusCode = 400;
            throw err;
        }

        if (Model === User) {
            // Remove all authorized post and files by this user
            const posts = await Post.remove(
                { author: doc._id }).exec();
            const files = await LocalFile.remove({
                author: doc._id,
            }).exec();
        } else if (Model === PostCategory) {
            // Remove this category from posts
            const raw = await Post.updateMany({
                categories: doc._id,
            }, {
                $pull: {
                    categories: doc._id,
                },
            }).exec();
        } else if (Model === LocalFile) {
            // Remove file from uploads folder
            unlinkSync(join(req.app.get('uploadsDir'), doc.filename));
        }

        res.json({
            status: 'ok',
            code: 200,
            message: `Object '${doc._id}' has been removed successfully.`,
            data: doc,
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            status: 'error',
            code: err.statusCode || 500,
            name: err.name,
            message: err.message,
        });
        next(err);
    }
 });

export default router;
