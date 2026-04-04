import { Server } from 'socket.io';
import { verifyUserToken } from './authToken.js';

/** @type {Server | null} */
let io = null;

const parseOrigins = () => {
  const raw =
    process.env.SOCKET_CORS_ORIGIN ||
    process.env.CORS_ORIGIN ||
    'http://localhost:3000';
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // Dev: browser origin is either localhost or 127.0.0.1 — allow both when one is listed
  const extras = [];
  for (const o of parts) {
    if (o.includes('localhost:')) {
      extras.push(o.replace(/localhost/g, '127.0.0.1'));
    }
    if (o.includes('127.0.0.1:')) {
      extras.push(o.replace(/127\.0\.0\.1/g, 'localhost'));
    }
  }
  return [...new Set([...parts, ...extras])];
};

/**
 * @param {import('http').Server} httpServer
 * @returns {Server}
 */
export const initSocket = (httpServer) => {
  const origins = parseOrigins();
  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: origins.length === 1 ? origins[0] : origins,
      methods: ['GET', 'HEAD', 'POST'],
      credentials: true,
    },
    allowEIO3: true,
  });

  const socketKey = process.env.CRM_SOCKET_KEY?.trim();
  if (socketKey) {
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (token === socketKey) {
        next();
        return;
      }
      next(new Error('Unauthorized'));
    });
    console.log('[Socket.io] CRM_SOCKET_KEY set — connections require auth.token');
  } else {
    console.warn(
      '[Socket.io] CRM_SOCKET_KEY not set — any origin may connect (set for production)'
    );
  }

  io.use((socket, next) => {
    const jwtStr = socket.handshake.auth?.jwt;
    if (!jwtStr || typeof jwtStr !== 'string' || !process.env.JWT_SECRET) {
      next();
      return;
    }
    try {
      const decoded = verifyUserToken(jwtStr.trim());
      if (decoded?.sub) {
        socket.data.userId = decoded.sub;
        socket.join(`user:${decoded.sub}`);
      }
    } catch {
      // Invalid JWT: still allow connection for global CRM events
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log('[Socket.io] client connected', socket.id);
    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] client disconnected', socket.id, reason);
    });
  });

  return io;
};

/** @returns {Server | null} */
export const getIo = () => io;

/**
 * @param {string} event
 * @param {unknown} payload
 */
export const emitToCrm = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

/**
 * @param {string} userId
 * @param {Record<string, unknown>} notificationApi
 */
export const emitNotificationToUser = (userId, notificationApi) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit('crm:notification', {
    notification: notificationApi,
  });
};
