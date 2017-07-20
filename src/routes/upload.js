import { Router } from 'express'
import { resolve } from 'path'
import { unlinkSync } from 'fs'
import multer from 'multer'
import uuidv1 from 'uuid/v1'
import LocalFile from '../models/LocalFile'

const router = Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_FOLDER || resolve(__dirname, '../../static/uploads/'))
    },
    filename: (req, file, cb) => {
        const nameParts = file.originalname.split('.')
        if (nameParts.length < 2) {
            return cb(new Error('File must has an extension'))
        }
        return cb(null, `${uuidv1()}.${nameParts[nameParts.length - 1]}`);
    }
})

const uploads = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 1, // Limit uploaded file size to 1 MB
    },
})

const uploadSingle = uploads.single('file')

router
.post('/single', function(req, res, next) {
    // Creating a single upload file promise
    new Promise(function(resolve, reject) {
        uploadSingle(req, res, function(err) {
            if (err) {
                reject(err)
            } else {
                resolve(req.file)
            }
        })
    }).then(function(file) {
        // Check if file was uploaded successfully
        if (file) {
            // Create a new LocalFile instance base on uploaded file
            return LocalFile.create({
                filename: file.filename,
                filetype: file.mimetype,
                filesize: file.size,
                path: `/static/uploads/${file.filename}`,
                author: req.user._id,
            })
        }
        throw new Error('File was not found')
    }).then(function(localFile) {
        // Check if the LocalFile instance was created or not
        if (localFile) {
            // Response to client
            return res.json({
                status: 'ok',
                code: 200,
                message: 'File has been uploaded successfully',
                data: {
                    localFile,
                },
            })
        }
        throw new Error('LocalFile instance was not exist')
    }).catch(function(err) {
        // Log to console
        console.error(err)

        // remove uploaded file on disk if exist
        if (req.file) {
            unlinkSync(resolve(req.file.destination, req.file.filename))
        }
        return res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    }).catch(function(err) {
        // Log to console if removing error occurred
        console.error(err)
        return res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    })
})
.post('/multi', function(req, res, next) {
    // TODO: Upload multiple file
})

export default router
