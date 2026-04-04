import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';
import { readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const require = createRequire(import.meta.url);

const ffmpegPath = () => {
  try {
    return require('ffmpeg-static');
  } catch {
    return process.env.FFMPEG_PATH || null;
  }
};

export const baseMime = (mime) =>
  String(mime ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();

/**
 * WhatsApp (Twilio) does not accept WebM for voice; Chrome records WebM.
 * Transcode to MP3 (MPEG) which WhatsApp supports.
 * @param {Buffer} inputBuffer
 * @returns {Promise<Buffer>}
 */
const webmToMp3 = async (inputBuffer) => {
  const bin = ffmpegPath();
  if (!bin) {
    throw new Error(
      'ffmpeg is not available (install ffmpeg-static or set FFMPEG_PATH) — required to send WebM voice notes to WhatsApp'
    );
  }

  const id = randomUUID();
  const inFile = join(tmpdir(), `crm-voice-in-${id}.webm`);
  const outFile = join(tmpdir(), `crm-voice-out-${id}.mp3`);

  await writeFile(inFile, inputBuffer);

  await new Promise((resolve, reject) => {
    const p = spawn(
      bin,
      [
        '-y',
        '-i',
        inFile,
        '-vn',
        '-ar',
        '44100',
        '-ac',
        '1',
        '-c:a',
        'libmp3lame',
        '-q:a',
        '4',
        outFile
      ],
      { stdio: 'ignore' }
    );
    p.on('error', reject);
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

  try {
    return await readFile(outFile);
  } finally {
    await unlink(inFile).catch(() => {});
    await unlink(outFile).catch(() => {});
  }
};

/**
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<{ buffer: Buffer, contentType: string, filename: string }>}
 */
export const prepareOutboundWhatsAppAudio = async (buffer, mimetype) => {
  const base = baseMime(mimetype);

  if (base === 'audio/webm' || base === 'video/webm') {
    const mp3 = await webmToMp3(buffer);
    return {
      buffer: mp3,
      contentType: 'audio/mpeg',
      filename: 'voice.mp3'
    };
  }

  const filenameFromMime = () => {
    if (base === 'audio/mpeg' || base === 'audio/mp3') return 'voice.mp3';
    if (base === 'audio/mp4' || base === 'audio/x-m4a') return 'voice.m4a';
    if (base === 'audio/ogg') return 'voice.ogg';
    if (base === 'audio/aac') return 'voice.aac';
    if (base === 'audio/wav' || base === 'audio/x-wav') return 'voice.wav';
    return 'voice.bin';
  };

  return {
    buffer,
    contentType: base || 'application/octet-stream',
    filename: filenameFromMime()
  };
};
