import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testConnection, pool } from './config/database.js';
let server;
async function startServer() {
    try {
        await testConnection();
        server = app.listen(env.PORT, () => {
            logger.info(`Server listening on http://localhost:${env.PORT}`, { env: env.NODE_ENV });
        });
        const gracefulShutdown = async (signal) => {
            logger.warn(`Received ${signal}, starting graceful shutdown`);
            if (server) {
                server.close(() => {
                    logger.info('HTTP server closed');
                });
            }
            try {
                await pool.end();
                logger.info('Database pool closed');
            }
            catch (err) {
                logger.error('Error closing database pool', { error: err });
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
