import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env.js';
export function validateMagicBytes(filePath) {
    try {
        const buffer = Buffer.alloc(12);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 12, 0);
        fs.closeSync(fd);
        const hex = buffer.toString('hex').toUpperCase();
        if (hex.startsWith('89504E47'))
            return true;
        if (hex.startsWith('FFD8FF'))
            return true;
        if (hex.startsWith('25504446'))
            return true;
        if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250')
            return true;
        return false;
    }
    catch (err) {
        console.error('Error reading magic bytes:', err);
        return false;
    }
}
if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, env.UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});
export const photoUpload = multer({
    storage,
    limits: {
        fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedMime = env.ALLOWED_MIME_TYPES;
        if (allowedMime.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
        }
    },
});
