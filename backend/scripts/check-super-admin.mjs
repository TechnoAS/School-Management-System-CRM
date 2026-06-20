import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [superAdmins] = await conn.query(
  "SELECT id, name, email, role, phone, created_at FROM users WHERE role = 'super_admin' ORDER BY created_at"
);

const [allUsers] = await conn.query('SELECT email, role, name FROM users ORDER BY role, email');

console.log('\nSuper admin accounts:', superAdmins.length);
for (const u of superAdmins) {
  console.log(`  • ${u.name} <${u.email}> (${u.role})`);
}

console.log('\nAll users in database:', allUsers.length);
for (const u of allUsers) {
  console.log(`  • ${u.role.padEnd(12)} ${u.email} — ${u.name}`);
}

await conn.end();
