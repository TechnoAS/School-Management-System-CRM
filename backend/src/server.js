import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testConnection } from './config/database.js';
import mongoose from 'mongoose';

let server;
async function startServer() {
    try {
        await testConnection();

        server = app.listen(env.PORT, () => {
            logger.info(`Server listening on http://localhost:${env.PORT}`, { env: env.NODE_ENV });
        });
        
        server.on('error', (error) => {
            if (error?.code === 'EADDRINUSE') {
                logger.error(`Port ${env.PORT} is already in use. Stop the process using that port or set PORT to a free port before starting the backend.`);
            }
            else {
                logger.error('HTTP server failed to start', { error });
            }
            process.exit(1);
        });
        
        const gracefulShutdown = async (signal) => {
            logger.warn(`Received ${signal}, starting graceful shutdown`);
            if (server) {
                server.close(() => {
                    logger.info('HTTP server closed');
                });
            }
            try {
                await mongoose.connection.close();
                logger.info('Database connection closed');
            }
            catch (err) {
                logger.error('Error closing database connection', { error: err });
            }
            process.exit(0);
        };
        
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
}

startServer();
