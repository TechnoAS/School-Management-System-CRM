import fs from 'fs';
import mysql from 'mysql2/promise';
import { env } from './env.js';
import { logger } from './logger.js';

const poolConfig = {
    uri: env.DATABASE_URL,
    connectionLimit: env.DATABASE_POOL_MAX,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

// Optionally include TLS CA when connecting to managed DBs (Aiven, RDS with custom CA, etc.)
if (env.DATABASE_SSL_CA_PATH) {
    try {
        const ca = fs.readFileSync(env.DATABASE_SSL_CA_PATH, 'utf8');
        // mysql2 accepts `ssl` option with an object containing `ca`
        poolConfig.ssl = { ca };
        logger.info('Using database SSL CA from ' + env.DATABASE_SSL_CA_PATH);
    }
    catch (err) {
        logger.warn('Failed to read DATABASE_SSL_CA_PATH, continuing without CA', { path: env.DATABASE_SSL_CA_PATH, error: err });
    }
} else if (env.DATABASE_URL.includes('aivencloud.com') || env.DATABASE_URL.includes('ssl-mode=')) {
    // Default to rejectUnauthorized: false for managed databases if no specific CA path is provided
    poolConfig.ssl = { rejectUnauthorized: false };
    logger.info('Using database SSL with rejectUnauthorized: false (managed DB detected)');
}

export const pool = mysql.createPool(poolConfig);
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
