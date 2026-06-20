import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
export async function hashPassword(password) {
    return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
const accessTokenOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
};
const refreshTokenOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
};
export function generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, accessTokenOptions);
}
export function generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
