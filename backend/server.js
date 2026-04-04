import 'dotenv/config';
import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import { corsMiddleware } from './middleware/cors.js';
import { protectApi } from './middleware/protectApi.js';
import authApiRouter from './routes/api/auth.js';
import usersApiRouter from './routes/api/users.js';
import orgApiRouter from './routes/api/org.js';
import {
  headTwilioMediaByToken,
  streamTwilioMediaByToken
} from './controllers/twilioMediaPublicController.js';
import leadsApiRouter from './routes/api/leads.js';
import messagesApiRouter from './routes/api/messages.js';
import dashboardApiRouter from './routes/api/dashboard.js';
import notificationsApiRouter from './routes/api/notifications.js';
import webhookRouter from './routes/webhook.js';
import webhookMessageStatusRouter from './routes/webhookMessageStatus.js';
import { initSocket } from './services/socketService.js';
import Lead from './models/Lead.js';
import Organization from './models/Organization.js';
import { dedupeOrganizationTwilioWhatsAppNumbers } from './services/mongoStartupDedupe.js';

const app = express();
// Default 3001 so Next.js can own 3000 in the same monorepo
const PORT = Number(process.env.PORT) || 3001;

app.get('/health', (req, res) => {
  const db =
    mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ ok: true, db });
});

app.use(
  '/webhook',
  express.urlencoded({ extended: false }),
  webhookRouter
);

app.use(
  '/webhook/message-status',
  express.urlencoded({ extended: false }),
  webhookMessageStatusRouter
);

app.use(corsMiddleware);
// Public: Twilio validates with HEAD then GET (HEAD must exist â€” not the same as GET in Express)
app.head('/api/twilio-media/:token', headTwilioMediaByToken);
app.get('/api/twilio-media/:token', streamTwilioMediaByToken);

app.use(express.json());

app.use('/api/auth', authApiRouter);
app.use('/api/org', orgApiRouter);

const apiRouter = express.Router();
apiRouter.use(protectApi);
apiRouter.use('/messages', messagesApiRouter);
apiRouter.use('/users', usersApiRouter);
apiRouter.use('/leads', leadsApiRouter);
apiRouter.use('/dashboard', dashboardApiRouter);
apiRouter.use('/notifications', notificationsApiRouter);

app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler â€” Twilio retries on 5xx; use 500 for transient DB errors.
app.use((err, req, res, _next) => {
  console.error('[Error]', err);
  if (req.originalUrl?.startsWith('/webhook')) {
    res
      .type('text/xml')
      .status(500)
      .send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    return;
  }
  if (req.originalUrl?.startsWith('/api/twilio-media')) {
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
    return;
  }
  if (req.originalUrl?.startsWith('/api')) {
    res.status(500).json({ success: false, error: 'Internal server error' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

const requiredEnv = ['MONGO_URI'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[MongoDB] Connected');
  try {
    await dedupeOrganizationTwilioWhatsAppNumbers();
  } catch (dedupeErr) {
    console.warn('[MongoDB] Twilio org dedupe:', dedupeErr?.message || dedupeErr);
  }
  try {
    await Lead.syncIndexes();
    console.log('[MongoDB] Lead indexes synced');
  } catch (syncErr) {
    console.warn('[MongoDB] Lead.syncIndexes:', syncErr?.message || syncErr);
  }
  try {
    await Organization.syncIndexes();
    console.log('[MongoDB] Organization indexes synced');
  } catch (syncErr) {
    console.warn('[MongoDB] Organization.syncIndexes:', syncErr?.message || syncErr);
  }
  try {
    await mongoose.connection.collection('leads').dropIndex('phone_number_1');
    console.log('[MongoDB] Dropped legacy unique index leads.phone_number_1');
  } catch {
    // Index already removed or never existed
  }
} catch (e) {
  console.error('[MongoDB] Connection failed', e);
  process.exit(1);
}

// Optional: seed a single default org (local/dev only). SaaS orgs should come from signup.
// Set SEED_DEFAULT_ORG=true to enable. Does nothing if an org with that slug already exists.
const seedDefaultOrgEnabled =
  String(process.env.SEED_DEFAULT_ORG || '').trim().toLowerCase() === 'true';
if (seedDefaultOrgEnabled) {
  try {
    const defaultSlug = (process.env.DEFAULT_ORG_SLUG || 'default').trim().toLowerCase();
    const exists = await Organization.exists({ slug: defaultSlug });
    if (!exists) {
      const org = await Organization.create({
        name: process.env.DEFAULT_ORG_NAME || 'Default Workspace',
        slug: defaultSlug,
        logo: process.env.DEFAULT_ORG_LOGO || '',
        primaryColor: process.env.DEFAULT_ORG_PRIMARY_COLOR || '',
        twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
        twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
      });
      console.log('[Organization] Seeded default org', org.slug);
    }
  } catch (e) {
    console.error('[Organization] Default org seed failed', e);
  }
}

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`);
  console.log(`[Server] Twilio webhook URL (local): http://localhost:${PORT}/webhook`);
  console.log(
    `[Server] Twilio outbound status URL (set PUBLIC_BASE_URL for prod): …/webhook/message-status`,
  );
  console.log(
    `[Server] CRM API: http://localhost:${PORT}/api/leads | POST .../api/messages/send`
  );
  console.log(`[Server] Socket.io: same host, path /socket.io`);
});
