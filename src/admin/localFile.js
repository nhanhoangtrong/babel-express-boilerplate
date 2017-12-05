import { Router } from 'express';
import logger from '../logger';

import { LocalFile } from '../models';
import { unlinkSync } from 'fs';
import { join } from 'path';

const router = Router();
router
    .use((req, res, next) => {
        // Set global locals params
        res.locals.section = 'localFiles';
        return next();
    })
    .get('/all', async (req, res, next) => {
        const page = parseInt(req.query.page, 10) || 0;
        const perPage = parseInt(req.query.per, 10) || 20;
        try {
            const localFiles = await LocalFile.find({})
                .skip(page * perPage)
                .limit(perPage)
                .populate('author')
                .sort('-updatedAt').exec();
            const total = await LocalFile.find({}).count().exec();

            res.render('admin/local-file-list', {
                title: 'All Local Files',
                localFiles,
                nPages: Math.ceil(total / perPage),
            });
        } catch (err) {
            next(err);
        }
    })
    .post('/remove', async (req, res, next) => {
        try {
            const localFile = LocalFile.findByIdAndRemove(req.body._id).exec();
            if (localFile) {
                unlinkSync(join(req.app.get('uploadsDir'), localFile.filename));
                return res.json({
                    status: 'ok',
                    code: 200,
                    message: 'LocalFile has been removed successfully',
                });
            }
            return res.json({
                status: 'error',
                code: 400,
                message: 'Local File was not found',
            });
        } catch (err) {
            // Log error to standard error output
            logger.error(JSON.stringify(err.stack, null, 2));
            res.json({
                status: 'error',
                code: 500,
                message: err.message,
            });
        }
    });

export default router;
