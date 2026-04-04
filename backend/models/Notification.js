import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['whatsapp_inbound', 'lead_created', 'lead_assigned'],
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
    meta: {
      leadId: { type: String, required: true },
      messageId: { type: String },
      preview: { type: String },
      leadName: { type: String },
      phone: { type: String },
      assigneeName: { type: String },
      assignerName: { type: String },
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    collection: 'notifications',
    versionKey: false,
  },
);

notificationSchema.index({ recipientUserId: 1, createdAt: -1 });
notificationSchema.index({ recipientUserId: 1, readAt: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
