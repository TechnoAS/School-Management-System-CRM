import { randomUUID } from 'crypto';
import crypto from 'crypto';
import { pool } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { queryOne } from '../../shared/db/query.js';
import { comparePassword, hashPassword, generateAccessToken, generateRefreshToken, verifyRefreshToken, } from '../../shared/utils/crypto.js';
import { UnauthorizedError, NotFoundError } from '../../shared/errors/app-error.js';
import { isJwtVerificationError } from '../../shared/utils/jwt-errors.js';
import { createAuditLog } from '../audit/audit.service.js';
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
export async function loginUser(email, password, ipAddress, userAgent) {
    const user = await queryOne('SELECT id, name, email, password_hash, role, phone, photo_url FROM users WHERE email = ?', [email]);
    const recordLoginAttempt = async (succeeded) => {
        try {
            await pool.query('INSERT INTO login_attempts (email, ip_address, succeeded) VALUES (?, ?, ?)', [email, ipAddress || 'unknown', succeeded ? 1 : 0]);
        }
        catch (err) {
            logger.warn('Failed to record login attempt', { email, error: err });
        }
    };
    if (!user) {
        await recordLoginAttempt(false);
        throw new UnauthorizedError('Invalid email or password');
    }
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
        await recordLoginAttempt(false);
        throw new UnauthorizedError('Invalid email or password');
    }
    await recordLoginAttempt(true);
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user.id });
    const tokenId = randomUUID();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await pool.query('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)', [tokenId, user.id, tokenHash, expiresAt, ipAddress, userAgent]);
    await createAuditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'users',
        entityId: user.id,
        ipAddress,
        userAgent,
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            photoUrl: user.photo_url,
        },
    };
}
export async function refreshSession(token, ipAddress, userAgent) {
    try {
        verifyRefreshToken(token);
    }
    catch (error) {
        if (isJwtVerificationError(error)) {
            throw new UnauthorizedError('Session authentication failed');
        }
        throw error;
    }
    const tokenHash = hashToken(token);
    const tokenRecord = await queryOne('SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
    if (!tokenRecord) {
        throw new UnauthorizedError('Session not found or expired');
    }
    if (tokenRecord.revoked_at || new Date(tokenRecord.expires_at) < new Date()) {
        throw new UnauthorizedError('Session is invalid or expired');
    }
    const user = await queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [tokenRecord.user_id]);
    if (!user) {
        throw new UnauthorizedError('User profile not found');
    }
    await pool.query('DELETE FROM refresh_tokens WHERE id = ?', [tokenRecord.id]);
    const newAccessToken = generateAccessToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
    const newRefreshToken = generateRefreshToken({ id: user.id });
    const newTokenId = randomUUID();
    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);
    await pool.query('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)', [newTokenId, user.id, newTokenHash, newExpiresAt, ipAddress, userAgent]);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
}
export async function logoutUser(token) {
    const tokenHash = hashToken(token);
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
}
export async function changeUserPassword(userId, currentPass, newPass, ipAddress, userAgent) {
    const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    const isMatch = await comparePassword(currentPass, user.password_hash);
    if (!isMatch) {
        throw new UnauthorizedError('Current password is incorrect');
    }
    const newHash = await hashPassword(newPass);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    await createAuditLog({
        userId,
        action: 'USER_PASSWORD_CHANGE',
        entity: 'users',
        entityId: userId,
        ipAddress,
        userAgent,
    });
}
export async function getUserById(userId) {
    return queryOne('SELECT id, name, email, role, phone, photo_url, created_at FROM users WHERE id = ?', [userId]);
}
