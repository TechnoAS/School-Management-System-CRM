import mysql from 'mysql2/promise';
import { env } from './env.js';
import { logger } from './logger.js';
export const pool = mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: env.DATABASE_POOL_MAX,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        logger.info('Database connected successfully via pool');
        connection.release();
    }
    catch (error) {
        logger.error('Database connection failed', { error });
        throw error;
    }
}
