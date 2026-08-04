import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export async function createAuditLog(params) {
    const { userId, action, entity, entityId, beforeData, afterData, ipAddress, userAgent } = params;
    try {
        await AuditLog.create({
            user_id: userId || null,
            action,
            entity: entity || null,
            entity_id: entityId || null,
            before_data: beforeData || null,
            after_data: afterData || null,
            ip_address: ipAddress || null,
            user_agent: userAgent || null,
        });
    }
    catch (error) {
        logger.warn('Failed to write audit log', { action, entity, entityId, error });
    }
}
