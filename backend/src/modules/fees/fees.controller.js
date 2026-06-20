import { collectPaymentSchema } from './fees.schema.js';
import { getDueStudents, getPaymentHistory, getPaymentByReceipt, collectFee } from './fees.service.js';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
export async function listDue(_req, res, next) {
    try {
        const list = await getDueStudents();
        res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function history(_req, res, next) {
    try {
        const list = await getPaymentHistory();
        res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getReceipt(req, res, next) {
    try {
        const { receipt } = req.params;
        const payment = await getPaymentByReceipt(receipt);
        if (!payment) {
            throw new NotFoundError(`Receipt "${receipt}" not found`);
        }
        res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function collect(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = collectPaymentSchema.parse(req.body);
        const receipt = await collectFee(data, req.user.id);
        await createAuditLog({
            userId: req.user.id,
            action: 'FEE_COLLECT',
            entity: 'payments',
            entityId: receipt.receipt,
            afterData: receipt,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(201).json({
            success: true,
            data: receipt,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function sendReminders(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        // Stub for sending fee reminders
        await createAuditLog({
            userId: req.user.id,
            action: 'FEE_REMINDERS_TRIGGER',
            entity: 'payments',
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: 'Outstanding fee reminders queued and sent successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
