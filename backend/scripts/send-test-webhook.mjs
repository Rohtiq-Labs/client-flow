/**
 * Simulates Twilio's POST to /webhook (same form fields as a real inbound WhatsApp).
 * Start the API first: npm start
 *
 * Loads backend/.env so PORT matches the Express server (avoids hitting Next.js on 3000).
 *
 * Usage:
 *   npm run test:webhook
 *   WEBHOOK_URL=http://127.0.0.1:3001/webhook node scripts/send-test-webhook.mjs
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const port = process.env.PORT || '3001';
const url =
  process.env.WEBHOOK_URL || `http://127.0.0.1:${port}/webhook`;

const body = new URLSearchParams({
  MessageSid: `SM${Date.now()}`,
  AccountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  From: 'whatsapp:+15551234567',
  To: 'whatsapp:+14155238886',
  Body: `Test inbound ${new Date().toISOString()}`,
  ProfileName: 'Webhook Test User',
  NumMedia: '0'
});

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body
});

const text = await res.text();
console.log('POST', url);
console.log('HTTP', res.status);
console.log('Response:', text.slice(0, 200));

if (!res.ok) {
  console.error('\nRequest failed.');
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    console.error(
      'You got an HTML page (often Next.js on :3000). Run Express on a different PORT (e.g. 3001 in backend/.env), run `npm start`, then `npm run test:webhook` again.'
    );
  } else {
    console.error('Is the API running? From backend: npm start');
  }
  process.exit(1);
}

console.log('\nCheck MongoDB: collection "messages" should have a new doc with direction "incoming".');
console.log('Atlas: Browse Collections → your DB → messages');
