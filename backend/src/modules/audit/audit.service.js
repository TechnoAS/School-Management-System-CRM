import { pool } from '../../config/database.js';
import { logger } from '../../config/logger.js';
export async function createAuditLog(params) {
    const { userId, action, entity, entityId, beforeData, afterData, ipAddress, userAgent, } = params;
    try {
        const query = `
      INSERT INTO audit_log (
        user_id, action, entity, entity_id, before_data, after_data, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const beforeJson = beforeData ? JSON.stringify(beforeData) : null;
        const afterJson = afterData ? JSON.stringify(afterData) : null;
        await pool.query(query, [
            userId || null,
            action,
            entity || null,
            entityId || null,
            beforeJson,
            afterJson,
            ipAddress || null,
            userAgent || null,
        ]);
    }
    catch (error) {
        logger.warn('Failed to write audit log', { action, entity, entityId, error });
    }
}
