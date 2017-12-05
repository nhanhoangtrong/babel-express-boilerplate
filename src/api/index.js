import { Router } from 'express';
import logger from '../logger';
import bodyParser from 'body-parser';
import cors from 'cors';

const router = Router()
    .use(bodyParser.json())
    .use(cors())
    .get('/', (req, res) => {
        res.json({
            message: 'This is API endpoints.',
        });
    })
    .use((req, res) => {
        return res.status(404).send({
            message: 'Path not found',
        });
    })
    // Handle API errors
    .use((err, req, res, next) => {
        // Logging error to logger
        logger.error(`${JSON.stringify(err, null, 2)}`);
        // Check the environment
        if (process.env.NODE_ENV !== 'development') {
            delete err.stack;
        }
        return res.status(500).send({
            error: err,
        });
    });

export default router;
