import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { pool } from './config/database.js';
import { logger } from './config/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { coursesRouter } from './modules/courses/courses.routes.js';
import { facultyRouter } from './modules/faculty/faculty.routes.js';
import { batchesRouter } from './modules/batches/batches.routes.js';
import { studentsRouter } from './modules/students/students.routes.js';
import { attendanceRouter } from './modules/attendance/attendance.routes.js';
import { feesRouter } from './modules/fees/fees.routes.js';
import { examsRouter } from './modules/exams/exams.routes.js';
import { certificatesRouter } from './modules/certificates/certificates.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { settingsRouter } from './modules/settings/settings.routes.js';
const app = express();
// 1. Security Headers (disable crossOriginResourcePolicy so cross-origin
//    multipart/FormData uploads from the Vite dev server aren't blocked)
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
// 2. CORS configuration
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// 3. Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// 4. HTTP Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    const { method, url } = req;
    logger.http(`→ ${method} ${url}`);
    res.on('finish', () => {
        const ms = Date.now() - start;
        const statusColor = res.statusCode >= 500 ? 'error'
            : res.statusCode >= 400 ? 'warn'
                : 'http';
        logger[statusColor](`← ${method} ${url} ${res.statusCode} (${ms}ms)`);
    });
    next();
});
// 5. Rate Limiting (Global for all /api endpoints)
app.use('/api', apiRateLimiter);
// Uploaded files (logos, student photos) — authentication required
// This prevents unauthenticated enumeration/download of uploaded assets.
app.get('/uploads/:filename', requireAuth, (req, res, next) => {
    // Reject any path-traversal attempts
    const filename = path.basename(req.params.filename);
    const filePath = path.resolve(env.UPLOAD_DIR, filename);
    // Ensure resolved path stays inside the upload directory
    if (!filePath.startsWith(path.resolve(env.UPLOAD_DIR))) {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: { message: 'File not found' } });
    }
    res.sendFile(filePath);
});
// 5. Health Check Route (Database connectivity check included)
app.get('/api/health', async (_req, res, next) => {
    try {
        // Check database connection pool
        const connection = await pool.getConnection();
        connection.release();
        res.status(200).json({
            success: true,
            message: 'TechAcademy CRM Backend is running',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        next(error);
    }
});
// 6. Feature Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/batches', batchesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api', feesRouter);
app.use('/api/exams', examsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api', dashboardRouter);
app.use('/api/settings', settingsRouter);
// 7. Centralized Error Handler (Must be registered last)
app.use(errorMiddleware);
export { app };
