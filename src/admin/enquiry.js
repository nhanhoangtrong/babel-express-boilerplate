import { Router } from 'express';
import logger from '../logger';

import { Enquiry } from '../models';

const router = Router();
router.use((req, res, next) => {
    res.locals.section = 'enquiry';
    next();
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
        const total = await Enquiry.find({}).count().exec();
        const enquiries = await Enquiry.find({}).skip((page - 1) * perPage).limit(perPage).exec();
        res.render('admin/enquiries-list', {
            title: 'All Enquiries sent by customers',
            enquiries,
            totalPages: Math.ceil(total / perPage),
            currentPage: page,
            perPage,
        });
    } catch(err) {
        next(err);
    }
});

export default router;
