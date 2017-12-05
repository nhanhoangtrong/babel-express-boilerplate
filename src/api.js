import { Router } from 'express';
import logger from './logger';
import bodyParser from 'body-parser';
import cors from 'cors';

import { userRoute, authRoute } from './auth/api';
import { postApi, postCategoryApi } from './post/api';
import { localFileApi } from './localFile/api';

export default Router()
    .use(bodyParser.json())
    .use(cors())
    // /user route
    .get('/', (req, res) => {
        res.json([
            userRoute.stack,
            postCategoryApi.stack,
            postApi.stack,
            localFileApi.stack,
        ]);
    })
    .use('/auth', authRoute)
    .use('/users', userRoute)
    .use('/posts', postApi)
    .use('/post-categories', postCategoryApi)
    .use('/local-files', localFileApi)
    // Handle not found error
    .use((req, res) => {
        return res.status(404).send({
            message: 'Route not found',
        });
    })
    .use((err, req, res, next) => {
        // Check the environment
        if (process.env.NODE_ENV === 'development') {
            return next(err);
        }
        logger.error('%j', err);
        delete err.stack;
        return res.status(500).send({
            message: err.message,
            error: err,
        });
    });
