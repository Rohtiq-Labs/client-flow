import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { mapNotificationToApi } from '../services/notificationPayload.js';

const requireHumanUser = (req, res) => {
  if (!req.user?.id || req.user.isApiKey) {
    res.status(403).json({ success: false, error: 'Forbidden' });
    return false;
  }
  return true;
};

export const listNotifications = async (req, res) => {
  try {
    if (!requireHumanUser(req, res)) return;
    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const unreadOnly =
      String(req.query.unreadOnly || '') === '1' ||
      String(req.query.unreadOnly).toLowerCase() === 'true';

    const filter = {
      organizationId: req.organizationId,
      recipientUserId: req.user.id,
    };
    if (unreadOnly) {
      filter.readAt = null;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({
        organizationId: req.organizationId,
        recipientUserId: req.user.id,
        readAt: null,
      }),
    ]);

    return res.json({
      success: true,
      notifications: notifications.map(mapNotificationToApi),
      unreadCount,
    });
  } catch (e) {
    console.error('[listNotifications]', e);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to load notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    if (!requireHumanUser(req, res)) return;
    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { notificationId } = req.params;
    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ success: false, error: 'Invalid id' });
    }

    const updated = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        organizationId: req.organizationId,
        recipientUserId: req.user.id,
      },
      { $set: { readAt: new Date() } },
      { new: true },
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    return res.json({
      success: true,
      notification: mapNotificationToApi(updated),
    });
  } catch (e) {
    console.error('[markNotificationRead]', e);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to update notification' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    if (!requireHumanUser(req, res)) return;
    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await Notification.updateMany(
      {
        organizationId: req.organizationId,
        recipientUserId: req.user.id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );

    return res.json({
      success: true,
      modifiedCount: result.modifiedCount ?? 0,
    });
  } catch (e) {
    console.error('[markAllNotificationsRead]', e);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to update notifications' });
  }
};
