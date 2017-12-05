import { Router } from 'express';
import logger from '../logger';

import { Enquiry } from '../models';

export default Router()
    .use((req, res, next) => {
        res.locals.section = 'enquiry';
        next();
    })
    .get('/', async (req, res, next) => {
        const page = parseInt(req.query.page, 10) || 0;
        const perPage = parseInt(req.query.per, 10) || 20;
        try {
            const total = await Enquiry.find({}).count().exec();
            const enquiries = await Enquiry.find({}).skip(page * perPage).limit(perPage).exec();
            res.render('admin/enquiry-list', {
                title: 'All Enquiries sent by customers',
                enquiries,
                nPages: Math.ceil(total / perPage),
            });
        } catch(err) {
            next(err);
        }
    })
    .post('/remove', async (req, res, next) => {
        const id = req.body._id || req.query._id;
        try {
            const enquiry = await Enquiry.findByIdAndRemove(id).exec();
            if (enquiry) {
                return res.json({
                    status: 'ok',
                    code: 200,
                    message: 'Enquiry has been removed successfully',
                });
            }
            return res.json({
                status: 'error',
                code: 400,
                message: 'Enquiry was not found',
            });
        } catch (err) {
            // Log error to standard error output
            logger.error('%j', err);
            res.json({
                status: 'error',
                code: 500,
                message: err.message,
            });
        }
    });
