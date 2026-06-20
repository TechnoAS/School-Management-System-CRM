import { pool } from '../../config/database.js';
export async function queryRows(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}
export async function queryOne(sql, params = []) {
    const rows = await queryRows(sql, params);
    return rows[0];
}
