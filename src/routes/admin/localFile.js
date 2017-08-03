import { Router } from 'express'
import LocalFile from '../../models/LocalFile'
import { unlinkSync } from 'fs'
import { resolve } from 'path'

export default Router()
.use((req, res, next) => {
    // Set global locals params
    res.locals.section = 'localFiles'
    return next()
})
.get('/all', (req, res, next) => {
    const page = req.params.page || 0
    const perPage = req.params.per || 20
    LocalFile.find({})
    .skip(page * perPage)
    .limit(perPage)
    .populate('author')
    .sort('-updatedAt').exec()
    .then((localFiles) => {
        res.render('admin/local-file-list', {
            title: 'All Local Files',
            localFiles,
        })
    })
    .catch(next)
})
.post('/remove', (req, res, next) => {
    LocalFile.findByIdAndRemove(req.body._id).exec()
    .then((result) => {
        if (result) {
            unlinkSync(resolve(__dirname, '../../../static/uploads', result.filename))
            return res.json({
                status: 'ok',
                code: 200,
                message: 'LocalFile has been removed successfully',
            })
        }
        return res.json({
            status: 'error',
            code: 404,
            message: 'Local File was not found',
        })
    })
    .catch((err) => {
        // Log error to standard error output
        console.error(err)
        res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    })
})
