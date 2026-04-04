import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import { canAccessLead } from '../services/leadAccess.js';
import {
  getGridfsFileLength,
  openDownloadStream
} from '../services/gridfsMediaService.js';

export const streamMessageImage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ success: false, error: 'Invalid message id' });
    }

    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const msg = await Message.findOne({
      _id: messageId,
      organizationId: req.organizationId
    }).lean();
    if (!msg?.image?.gridfs_file_id) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    const lead = await Lead.findOne({
      _id: msg.lead_id,
      organizationId: req.organizationId
    }).lean();
    if (!lead || !canAccessLead(req, lead)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const ct = (msg.image.content_type || 'application/octet-stream')
      .split(';')[0]
      .trim();
    const len = await getGridfsFileLength(msg.image.gridfs_file_id);
    if (len === null) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Length', String(len));
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const stream = openDownloadStream(msg.image.gridfs_file_id);
    stream.on('error', (err) => {
      console.error('[streamMessageImage]', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Failed to stream image' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

export const streamMessageAudio = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ success: false, error: 'Invalid message id' });
    }

    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const msg = await Message.findOne({
      _id: messageId,
      organizationId: req.organizationId
    }).lean();
    if (!msg?.audio?.gridfs_file_id) {
      return res.status(404).json({ success: false, error: 'Audio not found' });
    }

    const lead = await Lead.findOne({
      _id: msg.lead_id,
      organizationId: req.organizationId
    }).lean();
    if (!lead || !canAccessLead(req, lead)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const ct = (msg.audio.content_type || 'application/octet-stream')
      .split(';')[0]
      .trim();
    const len = await getGridfsFileLength(msg.audio.gridfs_file_id);
    if (len === null) {
      return res.status(404).json({ success: false, error: 'Audio not found' });
    }

    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Length', String(len));
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const stream = openDownloadStream(msg.audio.gridfs_file_id);
    stream.on('error', (err) => {
      console.error('[streamMessageAudio]', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Failed to stream audio' });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
