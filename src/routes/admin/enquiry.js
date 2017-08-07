import { Router } from 'express'
import winston from 'winston'

import Enquiry from '../../models/Enquiry'

export default Router()
.use((req, res, next) => {
    res.locals.section = 'enquiry'
    next()
})
.get('/all', (req, res, next) => {
    const page = parseInt(req.query.page) || 0
    const perPage = parseInt(req.query.per) || 20
    Enquiry
    .find({})
    .skip(page * perPage)
    .limit(perPage)
    .exec()
    .then((enquiries) => {
        res.render('admin/enquiry-list', {
            title: 'All Enquiries sent by customers',
            enquiries,
        })
    })
    .catch(next)
})
.post('/remove', (req, res, next) => {
    const id = req.body._id || req.query._id
    Enquiry.findByIdAndRemove(id).exec()
    .then((enquiry) => {
        if (enquiry) {
            return res.json({
                status: 'ok',
                code: 200,
                message: 'Enquiry has been removed successfully',
            })
        }
        return res.json({
            status: 'error',
            code: 404,
            message: 'Enquiry was not found',
        })
    })
    .catch((err) => {
        // Log error to standard error output
        winston.error('%j', err)
        res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    })
})
