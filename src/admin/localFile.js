import { Router } from 'express';
import logger from '../logger';

import { LocalFile } from '../models';
import { unlinkSync } from 'fs';
import { join } from 'path';

const router = Router();
router.use((req, res, next) => {
    // Set global locals params
    res.locals.section = 'localFiles';
    return next();
})
.get('/', async (req, res, next) => {
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    let perPage = parseInt(req.query.per, 10);
    if (isNaN(perPage) || perPage < 1) {
        perPage = 20;
    }
    try {
        const localFiles = await LocalFile.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('author')
            .sort('-updatedAt').exec();
        const total = await LocalFile.find({}).count().exec();

        res.render('admin/local-file-list', {
            title: 'All Local Files',
            localFiles,
            totalPages: Math.ceil(total / perPage),
            currentPage: page,
            perPage,
        });
    } catch (err) {
        next(err);
    }
})
// AJAX remote route
.post('/remove', async (req, res, next) => {
    try {
        const localFile = LocalFile.findByIdAndRemove(req.body._id).exec();
        if (localFile) {
            unlinkSync(join(req.app.get('uploadsDir'), localFile.filename));
            return res.json({
                status: 'ok',
                code: 200,
                message: 'LocalFile has been removed successfully.',
            });
        }
        return res.status(400).json({
            status: 'error',
            code: 400,
            name: 'Bad Request',
            message: 'Local File was not found.',
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            code: 500,
            name: err.name,
            message: err.message,
        });
        return next(err);
    }
});

export default router;
