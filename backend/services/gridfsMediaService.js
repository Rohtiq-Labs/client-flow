import mongoose from 'mongoose';

/**
 * Use mongoose.mongo (same driver / bson as Mongoose). Importing `mongodb` directly
 * can pull bson 7.x and causes BSONVersionError when saving Message documents.
 */
const BUCKET = 'whatsapp_media';

const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection not ready');
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET });
};

/**
 * @param {Buffer} buffer
 * @param {{ filename: string, metadata?: Record<string, unknown> }} options
 * @returns {Promise<mongoose.mongo.ObjectId>}
 */
export const uploadBuffer = async (buffer, options) => {
  const bucket = getBucket();
  const { filename, metadata = {} } = options;

  return new Promise((resolve, reject) => {
    const upload = bucket.openUploadStream(filename, { metadata });
    upload.on('error', reject);
    upload.on('finish', () => {
      resolve(upload.id);
    });
    upload.end(buffer);
  });
};

/**
 * @param {string|mongoose.mongo.ObjectId} id
 * @returns {import('stream').Readable}
 */
export const openDownloadStream = (id) => {
  const bucket = getBucket();
  const { ObjectId } = mongoose.mongo;
  const oid = typeof id === 'string' ? new ObjectId(id) : id;
  return bucket.openDownloadStream(oid);
};

/**
 * @param {string|mongoose.mongo.ObjectId} id
 * @returns {Promise<number | null>}
 */
export const getGridfsFileLength = async (id) => {
  const db = mongoose.connection.db;
  if (!db) {
    return null;
  }
  const { ObjectId } = mongoose.mongo;
  const oid = typeof id === 'string' ? new ObjectId(id) : id;
  const doc = await db.collection(`${BUCKET}.files`).findOne({ _id: oid });
  if (!doc || typeof doc.length !== 'number') {
    return null;
  }
  return doc.length;
};
