import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'replied', 'interested', 'converted', 'lost'],
      default: 'new',
      trim: true,
      index: true,
    },
    created_at: {
      type: Date,
      default: () => new Date()
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
  },
  {
    collection: 'leads',
    versionKey: false
  }
);

leadSchema.index({ organizationId: 1, phone_number: 1 }, { unique: true });

leadSchema.pre('validate', function migrateLegacyStatus(next) {
  const map = { contacted: 'replied', booked: 'converted' };
  const s = String(this.status || '').toLowerCase();
  if (map[s]) {
    this.status = map[s];
  }
  next();
});

// Mongoose creates the `leads` collection on first insert if it does not exist.
export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
