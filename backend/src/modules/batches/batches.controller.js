import { createBatchSchema, updateBatchSchema } from './batches.schema.js';
import { getAllBatches, getBatchById, getBatchStudents, createBatch, updateBatch, deleteBatch, } from './batches.service.js';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { createAuditLog } from '../audit/audit.service.js';
export async function listBatches(_req, res, next) {
    try {
        const list = await getAllBatches();
        res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getBatch(req, res, next) {
    try {
        const { id } = req.params;
        const batch = await getBatchById(id);
        if (!batch) {
            throw new NotFoundError(`Batch with ID "${id}" not found`);
        }
        res.status(200).json({
            success: true,
            data: batch,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getStudents(req, res, next) {
    try {
        const { id } = req.params;
        const students = await getBatchStudents(id);
        res.status(200).json({
            success: true,
            data: students,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function create(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const data = createBatchSchema.parse(req.body);
        const batch = await createBatch(data);
        await createAuditLog({
            userId: req.user.id,
            action: 'BATCH_CREATE',
            entity: 'batches',
            entityId: batch.id,
            afterData: batch,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(201).json({
            success: true,
            data: batch,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function update(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id } = req.params;
        const data = updateBatchSchema.parse(req.body);
        const oldBatch = await getBatchById(id);
        const updated = await updateBatch(id, data);
        await createAuditLog({
            userId: req.user.id,
            action: 'BATCH_UPDATE',
            entity: 'batches',
            entityId: id,
            beforeData: oldBatch,
            afterData: updated,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function remove(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const { id } = req.params;
        const oldBatch = await getBatchById(id);
        await deleteBatch(id);
        await createAuditLog({
            userId: req.user.id,
            action: 'BATCH_DELETE',
            entity: 'batches',
            entityId: id,
            beforeData: oldBatch,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
        });
        res.status(200).json({
            success: true,
            message: `Batch "${id}" deleted successfully`,
        });
    }
    catch (error) {
        next(error);
    }
}
