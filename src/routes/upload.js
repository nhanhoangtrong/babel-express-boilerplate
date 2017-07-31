/* eslint-disable no-undef */
import { Router } from 'express'
import path from 'path'
import { unlinkSync } from 'fs'
import multer from 'multer'
import uuidv1 from 'uuid/v1'
import LocalFile from '../models/LocalFile'

const router = Router()

const filename = (req, file, cb) => {
    cb(null, `${uuidv1()}${path.extname(file.originalname)}`)
}

const multerFiles = multer({
    storage: multer.diskStorage({
        destination: process.env.UPLOAD_FILES_FOLDER || path.resolve(__dirname, '../../static/uploads/'),
        filename,
    }),
    limits: {
        fileSize: 1024 * 1024 * 1, // Limit uploaded file size to 1 MB
    },
})

const multerImages = multer({
    storage: multer.diskStorage({
        destination: process.env.UPLOAD_IMAGES_FOLDER || path.resolve(__dirname, '../../static/uploads/images/'),
        filename,
    }),
    limits: {
        fileSize: 1024 * 1024 * 4, // Limit upload image size to 4 MB each file
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/
        const mimetype = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())

        if (mimetype && extname) {
            return cb(null, true)
        }
        return cb(new Error('Image upload only supports the following filetypes: ' + fileTypes))
    }
})

const singleLocalFile = (uploadFunc, dirUrl, req, res) => {
    // Creating a single upload file promise
    new Promise(function(resolve, reject) {
        uploadFunc(req, res, function(err) {
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
                path: path.join(dirUrl, file.filename),
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
                body: {
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
            unlinkSync(path.resolve(req.file.destination, req.file.filename))
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
}

router
.post('/file', function(req, res, next) {
    singleLocalFile(multerFiles.single('file'), '/static/uploads/', req, res)
})
.post('/image', function(req, res, next) {
    singleLocalFile(multerImages.single('imageFile'), '/static/uploads/images/', req, res)
})
.post('/multi-file', function(req, res, next) {
    // TODO: Upload multiple files
})
.post('/multi-image', function(req, res, next) {
    // TODO: Upload multiple images
})

export default router
