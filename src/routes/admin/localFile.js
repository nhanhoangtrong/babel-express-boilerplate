import { Router } from 'express'
import LocalFile from '../../models/LocalFile'
import { unlinkSync } from 'fs'
import { resolve } from 'path'

export default Router()
.use(function(req, res, next) {
    // Set global locals params
    res.locals.section = 'localFiles'
    return next()
})
.get('/all', function(req, res, next) {
    LocalFile.find({}).populate('author').sort('-updatedAt').exec()
    .then(function(localFiles) {
        res.render('admin/local-file-list', {
            title: 'All Local Files',
            localFiles,
        })
    })
})
.post('/remove', function(req, res, next) {
    LocalFile.findByIdAndRemove(req.body._id).exec()
    .then(function(result) {
        if (result) {
            unlinkSync(resolve(__dirname, '../../../static/uploads', result.filename))
            return res.json({
                status: 'ok',
                code: 200,
                message: 'LocalFile has been removed successfully',
            })
        }
        throw new Error('Local File was not found')
    }).catch(function(err) {
        // Log error to standard error output
        console.error(err)
        res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    })
})
