import mongoose from 'mongoose';

const normalizeSlug = (slug) =>
  String(slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
      trim: true,
    },
    primaryColor: {
      type: String,
      default: '',
      trim: true,
    },
    twilioAccountSid: {
      type: String,
      default: '',
      trim: true,
    },
    twilioAuthToken: {
      type: String,
      default: '',
      trim: true,
    },
    twilioWhatsAppNumber: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    collection: 'organizations',
    versionKey: false,
  }
);

organizationSchema.pre('validate', function normalize(next) {
  if (this.slug) {
    this.slug = normalizeSlug(this.slug);
  }
  next();
});

organizationSchema.index(
  { twilioWhatsAppNumber: 1 },
  {
    unique: true,
    sparse: true,
  }
);

export default
  mongoose.models.Organization ||
  mongoose.model('Organization', organizationSchema);
