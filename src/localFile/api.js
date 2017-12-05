import { Router } from 'express';

import { LocalFile } from '../models';

const availableFields = {
    __v: 0,
};

export const localFileApi = Router()
.get('/', (req, res, next) => {
    LocalFile.find({})
    .select(availableFields)
    .exec()
    .then((localFiles) => {
        res.json(localFiles);
    })
    .catch(next);
})
.get('/:id', (req, res, next) => {
    LocalFile
    .findById(req.params.id)
    .select(availableFields)
    .exec()
    .then((localFile) => {
        if (localFile) {
            return res.json(localFile);
        }
        return next();
    })
    .catch(next);
});
