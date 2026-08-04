import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function testConnection() {
    try {
        await mongoose.connect(env.MONGO_URI, {
            // Mongoose 6+ doesn't need useNewUrlParser, useUnifiedTopology etc.
        });
        logger.info('Database connected successfully via Mongoose');
    }
    catch (error) {
        logger.error('Database connection failed', { error });
        throw error;
    }
}
