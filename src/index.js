import './loadenv';
import app from './app';
import chalk from 'chalk';
import http from 'http';
import logger from './logger';

const host = app.get('host');
const port = app.get('port');

const server = http.createServer(app);

server.listen(port);

server.on('listening', () => {
    logger.info(chalk.cyan(`HTTP Server is running on http://${host}:${port}`));
});

server.on('error', (err) => {
    logger.error(chalk.red('Error:'), 'Server error');
    logger.error(err);
    server.close();
    process.exit(1);
});
