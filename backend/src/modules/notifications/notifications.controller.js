import { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, } from './notifications.service.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
export async function list(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const list = await getUserNotifications(req.user.id);
        res.status(200).json({
            success: true,
            data: list,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function read(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        const id = parseInt(req.params.id, 10);
        await markNotificationRead(id, req.user.id);
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    }
    catch (error) {
        next(error);
    }
}
export async function readAll(req, res, next) {
    try {
        if (!req.user) {
            throw new UnauthorizedError();
        }
        await markAllNotificationsRead(req.user.id);
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
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
        const id = parseInt(req.params.id, 10);
        await deleteNotification(id, req.user.id);
        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
