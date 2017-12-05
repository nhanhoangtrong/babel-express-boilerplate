import { Router } from 'express';
import { Enquiry } from '../models';

const router = Router();

const availableFields = {
    __v: 0,
};

router.get('/', (req, res, next) => {
    Enquiry.find({})
        .select(availableFields)
        .exec()
        .then((enquiries) => {
            res.json(enquiries);
        }).catch(next);
});

export default router;
