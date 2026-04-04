# Twilio WhatsApp webhook — local testing with ngrok

This backend receives WhatsApp messages at **POST `/webhook`**, upserts a **lead** in MongoDB, stores each **message**, returns empty TwiML (`<Response></Response>`), and can optionally auto-reply via the Twilio API.

## Prerequisites

- Node.js 18+ recommended (ES modules + top-level `await` in `server.js`)
- MongoDB running locally or Atlas URI
- Twilio account with WhatsApp Sandbox (or approved WhatsApp sender)

## Setup

### MongoDB Atlas `MONGO_URI`

Use the database name as the **path** after the cluster hostname, then standard options:

`mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority`

Do **not** use `...mongodb.net/?clientflow=...` — the driver treats `clientflow` as a connection option and fails with `option clientflow is not supported`.

1. Copy `.env.example` to `.env` and fill in `MONGO_URI`, `TWILIO_*` values from the [Twilio Console](https://console.twilio.com/).
2. Install dependencies: `npm install`
3. Start the server: `npm start` (or `npm run dev` for watch mode)

### Quick test: save a row in `messages` (no Twilio)

With the **Express** server running (`npm start` in `backend`), open a **second** terminal in `backend` and run:

```bash
npm run test:webhook
```

This repo’s API defaults to **`PORT=3001`** in `.env` so **Next.js can use 3000**. The test script reads `.env` and posts to `http://127.0.0.1:<PORT>/webhook`.

If you still get **404** and HTML, Express is not on that port—confirm the URL printed by `npm run test:webhook` matches `[Server] Listening on ...` from `npm start`.

You should see HTTP `200` and TwiML containing `<Response></Response>`. In **MongoDB Atlas** → **Browse Collections** → database `clientflow` (or whatever you used in `MONGO_URI`) → collection **`messages`**: expect a document with `direction: "incoming"`, your test `message` text, and `lead_id` pointing at **`leads`**.

To simulate a different sender, set `From` by editing `scripts/send-test-webhook.mjs` or use curl:

```bash
curl -s -o - -w "\nHTTP %{http_code}\n" -X POST http://127.0.0.1:3001/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "From=whatsapp:+15559876543" \
  --data-urlencode "Body=Hello from curl" \
  --data-urlencode "ProfileName=Curl User"
```

---

## Test flow (ngrok + real WhatsApp)

### Step 0: ngrok (one-time)

If `ngrok` is not installed, download it from [ngrok](https://ngrok.com/) and add your authtoken (`ngrok config add-authtoken ...`) so HTTPS tunnels stay stable.

### Step 1: Start the server

From the `backend` folder:

```bash
npm start
```

Confirm `http://localhost:3001/health` returns JSON with `"ok": true` and `"db": "connected"` (use your `PORT` from `.env` if different).

### Step 2: Run ngrok

Expose the same port as the API (default **3001**):

```bash
ngrok http 3001
```

Copy the **HTTPS** forwarding URL (for example `https://abcd-12-34-56-78.ngrok-free.app`).

### Step 3: Configure the Twilio sandbox webhook

In Twilio Console → **Messaging** → **Try it out** → **Send a WhatsApp message** (sandbox), set **When a message comes in** to:

`https://<your-ngrok-host>/webhook`

Method: **HTTP POST**.

Save.

**Where to find it:** [Twilio Console](https://console.twilio.com/) → **Develop** → **Messaging** → **Try it out** → **Send a WhatsApp message** — scroll to **Sandbox settings** and set **When a message comes in** to your public URL (not `localhost`).

**Check failures:** **Monitor** → **Logs** → **Errors** (or **Debugger**) shows Twilio’s view of webhook HTTP status and response body.

### Step 4: Send a WhatsApp message to the sandbox

Join the sandbox with the Twilio-provided keyword, then send any text. Watch the server console — each inbound payload is logged.

### Step 5: Verify MongoDB

In `mongosh` or Compass, open your database and check:

- **`leads`**: one document per unique phone (`phone_number`, optional `name` from `ProfileName`, `status: "new"`, `created_at`).
- **`messages`**: one document per inbound message (`lead_id`, `message`, `direction: "incoming"`, `timestamp`).

Collections are created automatically on first write.

---

## Optional auto-reply

In `.env`:

```env
AUTO_REPLY_ENABLED=true
AUTO_REPLY_MESSAGE=Hello! We got your message.
```

Requires valid `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER`.

---

## CRM: send WhatsApp (`POST /api/messages/send`)

Sends via Twilio first, then saves to **`messages`** only after Twilio accepts the send.

**Body (JSON):**

```json
{
  "leadId": "<MongoDB _id of lead>",
  "phone": "+923441212758",
  "message": "Hello, how can we help you?"
}
```

`phone` must match the lead’s `phone_number` in MongoDB (same E.164 format, e.g. `+92...`).

**Success:** `{ "success": true, "messageSid": "SM..." }`

**If `CRM_API_KEY` is set in `.env`:** send header `Authorization: Bearer <CRM_API_KEY>`.

Example (port **3001**):

```bash
curl -s -X POST http://127.0.0.1:3001/api/messages/send \
  -H "Content-Type: application/json" \
  -d "{\"leadId\":\"YOUR_LEAD_ID\",\"phone\":\"+923441212758\",\"message\":\"Hello from CRM\"}"
```

---

## Production notes

- Serve **HTTPS** only; Twilio requires a public URL.
- Consider [validating the `X-Twilio-Signature` header](https://www.twilio.com/docs/usage/webhooks/webhooks-security) so only Twilio can hit `/webhook`.
- Use a stable hostname (not a disposable ngrok URL) for production webhooks.
