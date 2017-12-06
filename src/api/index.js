import { Router } from 'express';
import logger from '../logger';
import bodyParser from 'body-parser';
import cors from 'cors';

const router = Router();

router.use(bodyParser.json())
.use(cors())
.get('/', (req, res) => {
    res.json({
        message: 'This is API endpoints.',
    });
})
.use((req, res) => {
    res.status(404).send({
        name: 'Error 404',
        message: 'Route Not Found.',
    });
})
// Handle API errors
.use((err, req, res, next) => {
    // Send the JSON response, then pass to app-level error handlers
    if (res.statusCode < 400) {
        res.statusCode = err.statusCode || 500;
    }
    res.json({
        name: err.name,
        message: err.message,
    });
    next(err);
});

export default router;
