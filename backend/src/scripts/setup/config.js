import crypto from 'crypto';
import { instituteToDatabaseName, defaultDbUser, defaultAdminEmail, } from './slug.js';
import { askRequired, askPassword, askYesNo, ask } from './prompt.js';
function generateSecret(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}
function generateDbPassword() {
    return crypto.randomBytes(18).toString('base64url');
}
export async function loadSetupConfig() {
    const interactive = process.env.SETUP_INTERACTIVE !== 'false';
    let instituteName = process.env.INSTITUTE_NAME?.trim() ?? '';
    if (!instituteName && interactive) {
        instituteName = await askRequired('Institute name (e.g. Triton Academy)');
    }
    if (!instituteName) {
        throw new Error('Set INSTITUTE_NAME in .env or run with interactive setup (SETUP_INTERACTIVE=true)');
    }
    const databaseName = process.env.DATABASE_NAME?.trim() || instituteToDatabaseName(instituteName);
    const dbUser = process.env.DB_USER?.trim() || defaultDbUser(databaseName);
    let dbPassword = process.env.DB_PASSWORD?.trim() ?? '';
    if (!dbPassword) {
        dbPassword = generateDbPassword();
        console.log(`ℹ️  Generated DB user password for "${dbUser}" (saved to .env)`);
    }
    const adminName = process.env.ADMIN_NAME?.trim() ||
        (interactive ? await ask('Admin full name [Administrator]: ') : '') ||
        'Administrator';
    const adminEmail = process.env.ADMIN_EMAIL?.trim() ||
        (interactive ? await ask(`Admin email [${defaultAdminEmail(databaseName)}]: `) : '') ||
        defaultAdminEmail(databaseName);
    let adminPassword = process.env.ADMIN_PASSWORD?.trim() ?? '';
    if (!adminPassword) {
        if (interactive) {
            adminPassword = await askPassword('Admin login password');
        }
        else {
            throw new Error('Set ADMIN_PASSWORD in .env or use interactive setup');
        }
    }
    else if (adminPassword.length < 8) {
        throw new Error('ADMIN_PASSWORD must be at least 8 characters');
    }
    const adminPhone = process.env.ADMIN_PHONE?.trim() || null;
    const seedSampleData = process.env.SEED_SAMPLE_DATA === 'true' ||
        (process.env.SEED_SAMPLE_DATA !== 'false' &&
            (interactive ? await askYesNo('Load sample courses, students, and demo data?', true) : true));
    let mysqlRootPassword = process.env.MYSQL_ROOT_PASSWORD?.trim() ?? '';
    if (!mysqlRootPassword) {
        if (interactive) {
            mysqlRootPassword = await askPassword('MySQL root password', 1);
        }
        else {
            throw new Error('Set MYSQL_ROOT_PASSWORD in .env for automated setup');
        }
    }
    return {
        instituteName,
        databaseName,
        dbUser,
        dbPassword,
        adminName,
        adminEmail,
        adminPassword,
        adminPhone,
        seedSampleData,
        mysqlRootPassword,
    };
}
export function buildDatabaseUrl(user, password, databaseName, host = '127.0.0.1', port = 3306) {
    return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${databaseName}`;
}
export function jwtSecretsForEnv() {
    return {
        access: process.env.JWT_ACCESS_SECRET?.trim() || generateSecret(32),
        refresh: process.env.JWT_REFRESH_SECRET?.trim() || generateSecret(32),
    };
}
