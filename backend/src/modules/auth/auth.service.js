import { randomUUID } from 'crypto';
import crypto from 'crypto';
import { logger } from '../../config/logger.js';
import { comparePassword, hashPassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/crypto.js';
import { UnauthorizedError, NotFoundError } from '../../shared/errors/app-error.js';
import { isJwtVerificationError } from '../../shared/utils/jwt-errors.js';
import { createAuditLog } from '../audit/audit.service.js';

import { User } from '../../models/User.js';
import { LoginAttempt } from '../../models/LoginAttempt.js';
import { RefreshToken } from '../../models/RefreshToken.js';

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function loginUser(email, password, ipAddress, userAgent) {
    const user = await User.findOne({ email }).lean();
    
    const recordLoginAttempt = async (succeeded) => {
        try {
            await LoginAttempt.create({
                email,
                ip_address: ipAddress || 'unknown',
                succeeded
            });
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
    
    await RefreshToken.create({
        id: tokenId,
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
    });
    
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
    const tokenRecord = await RefreshToken.findOne({ token_hash: tokenHash }).lean();
    
    if (!tokenRecord) {
        throw new UnauthorizedError('Session not found or expired');
    }
    
    if (tokenRecord.revoked_at || new Date(tokenRecord.expires_at) < new Date()) {
        throw new UnauthorizedError('Session is invalid or expired');
    }
    
    const user = await User.findOne({ id: tokenRecord.user_id }).lean();
    if (!user) {
        throw new UnauthorizedError('User profile not found');
    }
    
    await RefreshToken.deleteOne({ id: tokenRecord.id });
    
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
    
    await RefreshToken.create({
        id: newTokenId,
        user_id: user.id,
        token_hash: newTokenHash,
        expires_at: newExpiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
    });
    
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
}

export async function logoutUser(token) {
    const tokenHash = hashToken(token);
    await RefreshToken.deleteOne({ token_hash: tokenHash });
}

export async function changeUserPassword(userId, currentPass, newPass, ipAddress, userAgent) {
    const user = await User.findOne({ id: userId }).lean();
    if (!user) {
        throw new NotFoundError('User not found');
    }
    
    const isMatch = await comparePassword(currentPass, user.password_hash);
    if (!isMatch) {
        throw new UnauthorizedError('Current password is incorrect');
    }
    
    const newHash = await hashPassword(newPass);
    await User.updateOne({ id: userId }, { $set: { password_hash: newHash } });
    await RefreshToken.deleteMany({ user_id: userId });
    
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
    return await User.findOne({ id: userId }).select('id name email role phone photo_url created_at').lean();
}
