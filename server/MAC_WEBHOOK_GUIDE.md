# Making Your Mac Receive Webhooks from Make.com

## Problem
Make.com (cloud service) needs to send webhooks to your Mac (local computer), but your Mac isn't directly accessible from the internet.

## Solution: Use ngrok

ngrok creates a secure tunnel that gives your local server a public URL.

---

## Quick Start Guide

### Step 1: Install ngrok

```bash
brew install ngrok
```

Or download from: https://ngrok.com/download

### Step 2: Start Your Server

Open Terminal and run:

```bash
cd /Users/troy/Desktop/revel8/server
./start_with_ngrok.sh
```

Or manually:

```bash
cd /Users/troy/Desktop/revel8/server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start ngrok (in a NEW Terminal Window)

Open a **second terminal window** and run:

```bash
ngrok http 8000
```

You'll see output like this:

```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important:** Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 4: Configure Make.com

In your Make.com scenario:

1. Add a **Webhooks** module → **Custom webhook**
2. Create a new webhook
3. **Webhook URL:** `https://YOUR-NGROK-URL/api/v1/webhook/make`
   - Example: `https://abc123.ngrok.io/api/v1/webhook/make`
4. **Method:** POST
5. **Data structure:** JSON

### Step 5: Test It!

Send a test webhook from Make.com, and you should see it in your server terminal!

---

## Viewing Webhook Traffic

### Option 1: Server Logs
Watch your server terminal - all webhooks are logged there

### Option 2: ngrok Web Interface
Open in your browser: http://127.0.0.1:4040

This shows:
- All incoming requests
- Request/response details
- Timing information
- Replay requests for testing

---

## Testing Locally First

Before connecting Make.com, test locally:

```bash
curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test",
    "data": {"message": "Hello from my Mac!"},
    "timestamp": "2026-01-17T12:00:00Z"
  }'
```

Expected response:
```json
{
  "status": "success",
  "message": "Webhook received successfully",
  "received_data": { ... }
}
```

---

## Important Notes

### ngrok Free Tier
- ✅ Perfect for testing and development
- ✅ No credit card required
- ⚠️ URL changes every time you restart ngrok
- ⚠️ 40 requests/minute limit
- 💡 Sign up for a free account to get a static domain

### ngrok Paid Tier ($8/month)
- Static domain (URL never changes)
- No request limits
- Custom domains
- Better for long-term use

### Keep Both Terminals Open
You need TWO terminal windows running:
1. **Terminal 1:** Your server (`uvicorn main:app...`)
2. **Terminal 2:** ngrok (`ngrok http 8000`)

If either closes, the webhook won't work!

---

## Alternative Solutions

### Option 2: Deploy to Cloud (for Production)

Deploy your server to a cloud provider:
- **Railway** - Free tier, easy deployment
- **Fly.io** - Free tier, great for APIs
- **Heroku** - Simple deployment
- **AWS/GCP/Azure** - Full control

Then use the cloud URL in Make.com (no ngrok needed!)

### Option 3: Tailscale (for Team Access)

If Make.com supports custom network configs (unlikely), Tailscale creates a private network.

---

## Troubleshooting

### "Connection refused" in Make.com
- ✅ Check server is running (Terminal 1)
- ✅ Check ngrok is running (Terminal 2)
- ✅ Use HTTPS URL from ngrok (not HTTP)
- ✅ Check the URL is correct with `/api/v1/webhook/make` at the end

### ngrok URL not working
- Try restarting ngrok
- Check if you hit the rate limit (free tier: 40 req/min)
- Try the ngrok web interface: http://127.0.0.1:4040

### Server not receiving webhooks
- Check server logs for errors
- Verify the endpoint in ngrok dashboard (http://127.0.0.1:4040)
- Test with curl first using the ngrok URL

### ngrok command not found
```bash
# Install with Homebrew
brew install ngrok

# Or download and add to PATH
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
```

---

## Complete Workflow Example

```bash
# Terminal 1 - Start server
cd /Users/troy/Desktop/revel8/server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Start ngrok (in new window)
ngrok http 8000

# Note the URL, e.g., https://abc123.ngrok.io

# Terminal 3 - Test it (in new window)
curl -X POST https://abc123.ngrok.io/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Now configure Make.com to use: `https://abc123.ngrok.io/api/v1/webhook/make`

---

## Next Steps

1. ✅ Install ngrok: `brew install ngrok`
2. ✅ Start your server
3. ✅ Start ngrok
4. ✅ Copy the ngrok HTTPS URL
5. ✅ Configure Make.com with the URL
6. ✅ Send test webhook
7. ✅ Watch the magic happen! 🎉

---

## Questions?

- ngrok docs: https://ngrok.com/docs
- Make.com webhooks: https://www.make.com/en/help/tools/webhooks
- Your webhook endpoint: http://localhost:8000/api/v1/webhook/status (check status)
