/**
 * Load or refresh sample data (courses, faculty, students, exams, etc.)
 * Safe to re-run — uses ON DUPLICATE KEY UPDATE.
 *
 * Usage: npm run db:seed
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.resolve(__dirname, '../../sql/seed_sample_data.sql');
async function main() {
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
        console.error('❌ DATABASE_URL is not set in backend/.env');
        process.exit(1);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('\n🌱 Loading sample data...\n');
    const conn = await mysql.createConnection({ uri: url, multipleStatements: true });
    try {
        await conn.query(sql);
        console.log('✅ Sample data loaded successfully.\n');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
    finally {
        await conn.end();
    }
}
main();
