import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { loadSetupConfig, buildDatabaseUrl, jwtSecretsForEnv, } from './setup/config.js';
import { backendEnvPath, upsertEnvFile } from './setup/env-file.js';
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.resolve(__dirname, '../../sql');
async function runSqlFile(connection, filename) {
    const filePath = path.join(sqlDir, filename);
    let sql = fs.readFileSync(filePath, 'utf8');
    // Strip legacy USE lines — connection is already scoped to the target database
    sql = sql.replace(/^\s*USE\s+[\w`]+\s*;\s*/gim, '');
    console.log(`▶ Running ${filename}...`);
    await connection.query(sql);
    console.log(`✅ ${filename} complete`);
}
async function provisionDatabase(rootConn, config) {
    const dbId = mysql.escapeId(config.databaseName);
    const userIdent = mysql.escapeId(config.dbUser);
    if (process.env.DB_RESET === 'true') {
        console.log(`▶ Dropping database "${config.databaseName}" (DB_RESET)...`);
        await rootConn.query(`DROP DATABASE IF EXISTS ${dbId}`);
    }
    console.log(`▶ Creating database "${config.databaseName}"...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS ${dbId} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`▶ Creating app user "${config.dbUser}"...`);
    await rootConn.query(`CREATE USER IF NOT EXISTS ${userIdent}@'localhost' IDENTIFIED BY ?`, [config.dbPassword]);
    await rootConn.query(`ALTER USER ${userIdent}@'localhost' IDENTIFIED BY ?`, [config.dbPassword]);
    await rootConn.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${dbId}.* TO ${userIdent}@'localhost'`);
    await rootConn.query('FLUSH PRIVILEGES');
}
async function seedInstituteAndAdmin(connection, config) {
    const adminId = randomUUID();
    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    console.log('▶ Creating institute profile and admin account...');
    await connection.query(`INSERT INTO institute_settings (id, name, email, phone, academic_year)
     VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), phone = VALUES(phone)`, [
        config.instituteName,
        config.adminEmail,
        config.adminPhone,
        new Date().getFullYear() +
            '-' +
            String((new Date().getFullYear() + 1) % 100).padStart(2, '0'),
    ]);
    await connection.query('DELETE FROM users WHERE role IN (?, ?)', ['admin', 'super_admin']);
    await connection.query(`INSERT INTO users (id, name, email, password_hash, role, phone)
     VALUES (?, ?, ?, ?, 'super_admin', ?)`, [adminId, config.adminName, config.adminEmail, passwordHash, config.adminPhone]);
}
function writeEnv(config) {
    const envPath = backendEnvPath();
    const jwt = jwtSecretsForEnv();
    const databaseUrl = buildDatabaseUrl(config.dbUser, config.dbPassword, config.databaseName);
    upsertEnvFile(envPath, {
        INSTITUTE_NAME: config.instituteName,
        DATABASE_NAME: config.databaseName,
        DATABASE_URL: databaseUrl,
        DB_USER: config.dbUser,
        DB_PASSWORD: config.dbPassword,
        ADMIN_EMAIL: config.adminEmail,
        ADMIN_NAME: config.adminName,
        JWT_ACCESS_SECRET: jwt.access,
        JWT_REFRESH_SECRET: jwt.refresh,
    });
    console.log(`✅ Updated ${envPath}`);
}
async function main() {
    const isReset = process.env.DB_RESET === 'true';
    console.log(`\n🏫 School CRM — database ${isReset ? 'reset' : 'setup'}\n`);
    if (isReset) {
        console.log('⚠️  DB_RESET=true — all data in this database will be deleted.\n');
    }
    const config = await loadSetupConfig();
    console.log(`\n   Institute:  ${config.instituteName}`);
    console.log(`   Database:   ${config.databaseName}`);
    console.log(`   DB user:      ${config.dbUser}`);
    console.log(`   Admin email:  ${config.adminEmail}`);
    console.log(`   Sample data:  ${config.seedSampleData ? 'yes' : 'no'}\n`);
    const rootUrl = `mysql://root:${encodeURIComponent(config.mysqlRootPassword)}@127.0.0.1:3306`;
    let rootConn;
    let appConn;
    try {
        rootConn = await mysql.createConnection({
            uri: rootUrl,
            multipleStatements: true,
        });
        console.log('✅ Connected to MySQL as root\n');
        await provisionDatabase(rootConn, config);
        const dbId = mysql.escapeId(config.databaseName);
        await rootConn.query(`USE ${dbId}`);
        console.log(`✅ Using database "${config.databaseName}"\n`);
        await runSqlFile(rootConn, '001_init.sql');
        await seedInstituteAndAdmin(rootConn, config);
        if (config.seedSampleData) {
            await runSqlFile(rootConn, 'seed_sample_data.sql');
        }
        await rootConn.end();
        rootConn = undefined;
        const appUrl = buildDatabaseUrl(config.dbUser, config.dbPassword, config.databaseName);
        appConn = await mysql.createConnection({ uri: appUrl });
        await appConn.query('SELECT 1');
        console.log(`✅ Verified app user "${config.dbUser}" can connect\n`);
        await appConn.end();
        appConn = undefined;
        writeEnv(config);
        console.log('\n✅ Setup complete!\n');
        console.log('   Start API:     npm run dev');
        console.log(`   Admin login:   ${config.adminEmail}`);
        console.log('   Password:      (the admin password you chose)\n');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
    finally {
        await rootConn?.end().catch(() => undefined);
        await appConn?.end().catch(() => undefined);
    }
}
main();
