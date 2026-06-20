import jwt from 'jsonwebtoken';
export function isJwtVerificationError(error) {
    return (error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.NotBeforeError);
}
