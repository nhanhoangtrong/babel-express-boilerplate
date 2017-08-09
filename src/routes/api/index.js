import { Router } from 'express'
import winston from 'winston'
import bodyParser from 'body-parser'
import cors from 'cors'

import usersRoute from './users'
import postsRoute from './posts'
import postCategoriesRoute from './postCategories'
import localFilesRoute from './localFiles'

import User from '../../models/User'

export default Router()
.use(bodyParser.json())
.use(cors())
// /user route
.get('/', (req, res, next) => {
    res.json([
        usersRoute.stack,
        postCategoriesRoute.stack,
        postsRoute.stack,
        localFilesRoute.stack,
    ])
})
.use('/users', usersRoute)
.use('/posts', postsRoute)
.use('/post-categories', postCategoriesRoute)
.use('/local-files', localFilesRoute)
// Handle not found error
.use((req, res, next) => {
    return res.status(404).send({
        message: 'Route not found',
    })
})
.use((err, req, res, next) => {
    // Check the environment
    if (process.env.NODE_ENV === 'development') {
        return next(err)
    }
    winston.error('%j', err)
    delete err.stack
    return res.status(500).send({
        message: err.message,
        error: err,
    })
})
