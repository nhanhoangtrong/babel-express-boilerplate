/* eslint-disable no-undef */
import { Router } from 'express'
import winston from 'winston'

import path from 'path'
import { unlinkSync } from 'fs'
import multer from 'multer'
import uuidv1 from 'uuid/v1'
import LocalFile from '../models/LocalFile'

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

const singleLocalFile = (uploadFunc, dirUrl, req, res, next) => {
    // Creating a single upload file promise
    new Promise((resolve, reject) => {
        uploadFunc(req, res, (err) => {
            if (err) {
                return reject(err)
            }
            return resolve(req.file)
        })
    }).then((file) => {
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
    }).then((localFile) => {
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
    }).catch((err) => {
        // Log to console
        winston.error('%j', err)

        // remove uploaded file on disk if exist
        if (req.file) {
            unlinkSync(path.resolve(req.file.destination, req.file.filename))
        }
        return res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    }).catch((err) => {
        // Log to console if removing error occurred
        winston.error('%j', err)
        return res.json({
            status: 'error',
            code: 500,
            message: err.message,
        })
    })
}

export default Router()
.post('/file', (req, res, next) => {
    singleLocalFile(multerFiles.single('file'), '/static/uploads/', req, res, next)
})
.post('/image', (req, res, next) => {
    singleLocalFile(multerImages.single('imageFile'), '/static/uploads/images/', req, res, next)
})
.post('/multi-file', (req, res, next) => {
    // TODO: Upload multiple files
})
.post('/multi-image', (req, res, next) => {
    // TODO: Upload multiple images
})
