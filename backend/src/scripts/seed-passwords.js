import dotenv from 'dotenv';
import { pool } from '../config/database.js';
import { hashPassword } from '../shared/utils/crypto.js';
dotenv.config();
/**
 * Reset the admin password from .env (ADMIN_EMAIL + ADMIN_PASSWORD).
 * Run after changing ADMIN_PASSWORD in .env.
 */
async function resetAdminPassword() {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();
    if (!email || !password) {
        console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env');
        process.exit(1);
    }
    if (password.length < 8) {
        console.error('❌ ADMIN_PASSWORD must be at least 8 characters');
        process.exit(1);
    }
    console.log(`🔄 Updating password for ${email}...`);
    try {
        const hash = await hashPassword(password);
        const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [
            hash,
            email,
        ]);
        const affected = result.affectedRows ?? 0;
        if (affected === 0) {
            console.error(`❌ No user found with email ${email}. Run npm run db:setup first.`);
            process.exit(1);
        }
        console.log('✅ Admin password updated.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Failed to update password:', error);
        process.exit(1);
    }
}
resetAdminPassword();
