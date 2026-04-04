import express from 'express';
import multer from 'multer';
import {
  streamMessageAudio,
  streamMessageImage
} from '../../controllers/messageMediaController.js';
import { sendMessage } from '../../controllers/messageController.js';
import { sendImageMessage } from '../../controllers/messageImageController.js';
import { sendVoiceMessage } from '../../controllers/messageVoiceController.js';

const router = express.Router();

const ALLOWED_AUDIO = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/aac',
  'audio/wav',
  'audio/x-wav',
  'audio/opus',
  'audio/x-m4a',
  'video/webm'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_CRM_VOICE_BYTES ?? 16 * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const base = (file.mimetype || '').split(';')[0].trim().toLowerCase();
    if (ALLOWED_AUDIO.has(base)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported or missing audio type'));
    }
  }
});

const voiceUpload = (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Audio file is too large'
          : err.message || 'Upload failed';
      res.status(400).json({ success: false, error: msg });
      return;
    }
    res.status(400).json({
      success: false,
      error: typeof err?.message === 'string' ? err.message : 'Upload failed'
    });
  });
};

const ALLOWED_IMAGE = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
]);

const imageUploadMulter = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_CRM_IMAGE_BYTES ?? 5 * 1024 * 1024)
  },
  fileFilter: (req, file, cb) => {
    const base = (file.mimetype || '').split(';')[0].trim().toLowerCase();
    if (base === 'image/jpg' || ALLOWED_IMAGE.has(base)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported or missing image type'));
    }
  }
});

const imageUpload = (req, res, next) => {
  imageUploadMulter.single('image')(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Image file is too large (max 5MB for WhatsApp)'
          : err.message || 'Upload failed';
      res.status(400).json({ success: false, error: msg });
      return;
    }
    res.status(400).json({
      success: false,
      error: typeof err?.message === 'string' ? err.message : 'Upload failed'
    });
  });
};

router.post('/send', sendMessage);
router.post('/send-voice', voiceUpload, sendVoiceMessage);
router.post('/send-image', imageUpload, sendImageMessage);
router.get('/:messageId/image', streamMessageImage);
router.get('/:messageId/audio', streamMessageAudio);

export default router;
