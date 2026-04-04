import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true
    },
    twilio_message_sid: {
      type: String,
      index: true,
      sparse: true,
      trim: true
    },
    message_type: {
      type: String,
      enum: ['text', 'audio', 'image', 'mixed'],
      default: 'text',
      index: true
    },
    // Inbound (Twilio webhook) — kept for existing documents
    message: {
      type: String,
      default: ''
    },
    // Outbound (CRM) — primary text for dashboard send
    body: {
      type: String
    },
    from: {
      type: String,
      trim: true
    },
    to: {
      type: String,
      trim: true
    },
    direction: {
      type: String,
      required: true,
      enum: ['incoming', 'outgoing']
    },
    /** Outbound only — Twilio status callback (sent → delivered → read). */
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    audio: {
      gridfs_file_id: {
        type: mongoose.Schema.Types.ObjectId
      },
      content_type: {
        type: String,
        trim: true
      },
      size_bytes: {
        type: Number
      },
      twilio_media_sid: {
        type: String,
        trim: true
      },
      storage_failed: {
        type: Boolean
      },
      error: {
        type: String
      }
    },
    image: {
      gridfs_file_id: {
        type: mongoose.Schema.Types.ObjectId
      },
      content_type: {
        type: String,
        trim: true
      },
      size_bytes: {
        type: Number
      },
      twilio_media_sid: {
        type: String,
        trim: true
      },
      storage_failed: {
        type: Boolean
      },
      error: {
        type: String
      }
    },
    timestamp: {
      type: Date,
      default: () => new Date()
    },
    createdAt: {
      type: Date
    }
  },
  {
    collection: 'messages',
    versionKey: false
  }
);

messageSchema.index({ organizationId: 1, lead_id: 1, timestamp: 1 });

// Mongoose creates the `messages` collection on first insert if it does not exist.
export default mongoose.models.Message || mongoose.model('Message', messageSchema);
