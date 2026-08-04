import { ForbiddenError } from '../../shared/errors/app-error.js';
import { Notification } from '../../models/Notification.js';

export async function getUserNotifications(userId) {
    const notifs = await Notification.find({
        $or: [{ user_id: userId }, { user_id: null }]
    }).sort({ created_at: -1 }).lean();
    
    return notifs.map(n => ({
        id: n._id.toString(), // Mongoose ID
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        createdAt: n.created_at,
    }));
}

export async function markNotificationRead(id, userId) {
    await Notification.updateOne(
        { _id: id, $or: [{ user_id: userId }, { user_id: null }] },
        { $set: { is_read: true } }
    );
}

export async function markAllNotificationsRead(userId) {
    await Notification.updateMany(
        { $or: [{ user_id: userId }, { user_id: null }] },
        { $set: { is_read: true } }
    );
}

export async function deleteNotification(id, userId, userRole) {
    const notif = await Notification.findById(id);
    if (!notif) return;
    
    const isBroadcast = notif.user_id === null;
    if (isBroadcast && userRole !== 'admin' && userRole !== 'staff' && userRole !== 'super_admin') {
        throw new ForbiddenError('Only administrators can delete broadcast notifications');
    }
    
    if (notif.user_id === userId || isBroadcast) {
        await Notification.deleteOne({ _id: id });
    }
}

export async function createNotification(userId, type, title, message) {
    await Notification.create({
        user_id: userId,
        type,
        title,
        message
    });
}
