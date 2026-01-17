# 🔔 Webhook Toast - Quick Reference

## 🎯 One-Command Test

```bash
# Restart server (Terminal 19)
cd /Users/troy/Desktop/revel8/server && uv run python main.py

# Open browser: http://localhost:5173
# Click: "🔔 Test Webhook Toast" button
# ✨ Toast appears!
```

## 📡 Send Test Webhook

```bash
# Option 1: Use test script
./test_toast_webhook.sh

# Option 2: Use curl
curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","data":{"message":"Hello!"}}'
```

## 📋 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/webhook/make` | POST | Receive webhooks |
| `/api/v1/webhook/stream` | GET | SSE stream for clients |
| `/api/v1/webhook/status` | GET | Check webhook status |

## 🔍 Debug Checklist

```bash
# 1. Server running?
curl http://localhost:8000/api/v1/webhook/status

# 2. Send test webhook
curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'

# 3. Check browser console (F12)
# Look for: EventSource, SSE, or connection errors

# 4. Check server logs
# Should see: "Received webhook from Make: ..."
```

## 🎨 Customization

### Change toast duration (5s → 10s):
```typescript
// In App.tsx
toast.success("Webhook Received", {
  description: ...,
  duration: 10000, // milliseconds
});
```

### Change toast position:
```typescript
// In App.tsx, add position prop to <Toaster />
<Toaster position="top-right" />
// Options: top-left, top-center, top-right, 
//          bottom-left, bottom-center, bottom-right
```

### Change toast theme:
```typescript
// In src/components/ui/sonner.tsx
<Sonner
  theme="light"  // or "dark"
  ...
/>
```

## 📁 Important Files

```
client/src/
  ├─ App.tsx                           # SSE connection
  ├─ components/
  │  ├─ ui/sonner.tsx                 # Toast component
  │  └─ WebhookTestButton.tsx         # Test button
  └─ pages/TargetSelection.tsx        # UI page

server/api/v1/routes/
  └─ webhook.py                        # SSE + webhook endpoints

Root:
  ├─ test_toast_webhook.sh            # Test script
  ├─ TOAST_NOTIFICATIONS.md           # Full docs
  ├─ IMPLEMENTATION_SUMMARY.md        # Summary
  └─ ARCHITECTURE_FLOW.md             # Architecture
```

## 💡 How It Works

```
Webhook → Server → SSE Broadcast → Client → Toast! 🎉
```

1. Webhook hits `/api/v1/webhook/make`
2. Server broadcasts to all SSE connections
3. Client EventSource receives event
4. Toast displays with webhook data
5. Auto-dismisses after 5 seconds

## 🚀 Production Tips

- [ ] Add webhook signature verification
- [ ] Add authentication to SSE endpoint
- [ ] Use Redis for multi-server broadcasting
- [ ] Store events in database
- [ ] Add rate limiting
- [ ] Use HTTPS in production

## 📞 Support

If toasts aren't appearing:
1. **Restart the server** (most common fix!)
2. Check browser console for errors
3. Verify CORS settings
4. Test with `curl` first
5. Check server logs

## ✅ Success Indicators

You know it's working when:
- ✅ Browser console shows: EventSource connected
- ✅ Server logs show: "Received webhook from Make: ..."
- ✅ Toast appears with JSON data
- ✅ Test button triggers toast immediately

---

**Ready to test?** → Restart server → Open browser → Click test button!
