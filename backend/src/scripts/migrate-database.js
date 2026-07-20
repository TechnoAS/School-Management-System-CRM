/**
 * Idempotent schema migrations for existing databases.
 * Images/files live in object storage (R2); DB stores URLs and metadata only.
 */
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { pathToFileURL } from 'url';

dotenv.config();

/** Each step adds one column if missing. */
const MIGRATIONS = [
    {
        id: '004_student_extra_data',
        steps: [{ table: 'students', column: 'extra_data', ddl: 'JSON NULL' }],
    },
    {
        id: '005_course_media',
        steps: [
            { table: 'courses', column: 'logo_url', ddl: 'TEXT NULL' },
            { table: 'courses', column: 'banner_url', ddl: 'TEXT NULL' },
            { table: 'courses', column: 'start_date', ddl: 'DATE NULL' },
            { table: 'courses', column: 'end_date', ddl: 'DATE NULL' },
            { table: 'courses', column: 'extra_data', ddl: 'JSON NULL' },
        ],
    },
];

async function columnExists(connection, table, column) {
    const [rows] = await connection.query(
        `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    return Number(rows[0]?.c ?? 0) > 0;
}

async function ensureMigrationsTable(connection) {
    await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(120) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function migrationApplied(connection, id) {
    await ensureMigrationsTable(connection);
    const [rows] = await connection.query('SELECT id FROM schema_migrations WHERE id = ?', [id]);
    return rows.length > 0;
}

async function markMigration(connection, id) {
    await connection.query('INSERT IGNORE INTO schema_migrations (id) VALUES (?)', [id]);
}

async function addColumnIfMissing(connection, table, column, ddl) {
    if (await columnExists(connection, table, column)) {
        return false;
    }
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${ddl}`);
    return true;
}

export async function runDatabaseMigrations(connection) {
    await ensureMigrationsTable(connection);

    for (const migration of MIGRATIONS) {
        let changed = false;
        for (const step of migration.steps) {
            const added = await addColumnIfMissing(connection, step.table, step.column, step.ddl);
            if (added) {
                console.log(`  + ${step.table}.${step.column}`);
                changed = true;
            }
        }

        if (changed) {
            console.log(`▶ Applied migration ${migration.id}`);
        }

        if (!await migrationApplied(connection, migration.id)) {
            await markMigration(connection, migration.id);
        }
    }
}

async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL is not set');
        process.exit(1);
    }

    const ssl =
        databaseUrl.includes('aivencloud.com') || databaseUrl.includes('ssl-mode=')
            ? { rejectUnauthorized: false }
            : undefined;

    let connection;
    try {
        connection = await mysql.createConnection({ uri: databaseUrl, ssl });
        console.log('\n🏫 Running database migrations…\n');
        await runDatabaseMigrations(connection);
        console.log('\n✅ Migrations complete.\n');
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
    finally {
        await connection?.end().catch(() => undefined);
    }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main();
}
