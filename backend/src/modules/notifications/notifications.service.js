import { pool } from '../../config/database.js';
export async function getUserNotifications(userId) {
    const [rows] = await pool.query(`SELECT id, type, title, message, is_read as isRead, created_at as createdAt 
     FROM notifications 
     WHERE user_id = ? OR user_id IS NULL 
     ORDER BY created_at DESC`, [userId]);
    return rows;
}
export async function markNotificationRead(id, userId) {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, userId]);
}
export async function markAllNotificationsRead(userId) {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [userId]);
}
export async function deleteNotification(id, userId) {
    await pool.query('DELETE FROM notifications WHERE id = ? AND (user_id = ? OR user_id IS NULL)', [id, userId]);
}
export async function createNotification(userId, type, title, message) {
    await pool.query('INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)', [userId, type, title, message]);
}
