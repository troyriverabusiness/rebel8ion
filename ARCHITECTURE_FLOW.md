# Toast Notification System - Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK TOAST SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

FLOW DIAGRAM:

┌──────────────┐                    ┌──────────────┐
│              │                    │              │
│  External    │    1. POST         │   FastAPI    │
│  Webhook     │──────────────────▶ │   Server     │
│  Source      │    /api/v1/        │  (Port 8000) │
│  (Make.com)  │    webhook/make    │              │
│              │                    │              │
└──────────────┘                    └──────┬───────┘
                                          │
                                          │ 2. Broadcast Event
                                          │    via SSE
                                          ▼
                              ┌─────────────────────┐
                              │  SSE Event Queue    │
                              │  (in-memory)        │
                              │  - Last 100 events  │
                              └──────┬──────────────┘
                                     │
                                     │ 3. Stream to
                                     │    all connected
                                     │    clients
                                     ▼
                        ┌────────────────────────┐
                        │   EventSource          │
                        │   Connection           │
                        │   /api/v1/             │
                        │   webhook/stream       │
                        └────────┬───────────────┘
                                 │
                                 │ 4. Receive JSON
                                 │    event data
                                 ▼
                    ┌─────────────────────────┐
                    │   React Client          │
                    │   (Browser)             │
                    │                         │
                    │   App.tsx:              │
                    │   - useEffect hook      │
                    │   - EventSource setup   │
                    └──────────┬──────────────┘
                               │
                               │ 5. Display Toast
                               ▼
                    ┌──────────────────────┐
                    │   Sonner Toast UI    │
                    │   - Success icon     │
                    │   - JSON payload     │
                    │   - Auto-dismiss 5s  │
                    └──────────────────────┘


ALTERNATIVE TESTING FLOW (Using UI Button):

┌──────────────┐                    ┌──────────────┐
│              │    1. Click        │              │
│  User clicks │────────────▶       │  React       │
│  Test Button │                    │  Component   │
│              │                    │              │
└──────────────┘                    └──────┬───────┘
                                          │
                                          │ 2. fetch() POST
                                          │    to webhook
                                          ▼
                                  ┌──────────────┐
                                  │   Server     │
                                  │   Webhook    │
                                  │   Endpoint   │
                                  └──────┬───────┘
                                         │
                                         │ 3. Broadcast
                                         │    via SSE
                                         ▼
                                  ┌──────────────┐
                                  │  EventSource │
                                  │  receives    │
                                  │  event       │
                                  └──────┬───────┘
                                         │
                                         │ 4. Toast!
                                         ▼
                                  ┌──────────────┐
                                  │  🔔 Toast    │
                                  │  appears     │
                                  └──────────────┘


KEY COMPONENTS:

[Server] /server/api/v1/routes/webhook.py
  ├─ POST /webhook/make        → Receives webhooks
  ├─ GET  /webhook/stream      → SSE endpoint
  ├─ webhook_events (deque)    → Event storage
  └─ event_subscribers (list)  → Connected clients

[Client] /client/src/App.tsx
  ├─ useEffect()               → Establishes SSE connection
  ├─ EventSource               → Listens for events
  ├─ toast.success()           → Displays notification
  └─ <Toaster />               → Toast container

[UI] /client/src/components/ui/sonner.tsx
  └─ Sonner component with custom styling

[Test] /client/src/components/WebhookTestButton.tsx
  └─ Button that triggers test webhook


CONNECTION LIFECYCLE:

1. Client mounts → EventSource connects to /webhook/stream
2. Server adds client to event_subscribers list
3. Webhook arrives → Server broadcasts to all subscribers
4. Client receives event → Parses JSON → Shows toast
5. Client unmounts → EventSource closes → Removed from subscribers


ERROR HANDLING:

- Connection lost? → EventSource auto-reconnects
- JSON parse error? → Logged to console, no toast
- Webhook timeout? → Keep-alive every 30s maintains connection
- Server restart? → Client auto-reconnects when server is back


TESTING METHODS:

Method 1: UI Button (Easiest)
  → Click "🔔 Test Webhook Toast" button

Method 2: Bash Script
  → ./test_toast_webhook.sh

Method 3: Manual curl
  → curl -X POST http://localhost:8000/api/v1/webhook/make ...

Method 4: External webhook (Make.com, Zapier, etc.)
  → Configure to POST to http://your-server:8000/api/v1/webhook/make
```

## Quick Start Checklist

- [ ] Server running on port 8000
- [ ] Client running on port 5173
- [ ] Browser open to http://localhost:5173
- [ ] Click test button OR send webhook
- [ ] See toast notification appear! 🎉

## Troubleshooting

**No toast appearing?**
1. Check browser console for SSE connection errors
2. Verify server is running: http://localhost:8000/api/v1/webhook/status
3. Check server logs for incoming webhook
4. Ensure CORS is configured correctly (already done)

**SSE connection failing?**
1. Restart the server (it needs to load the new /webhook/stream endpoint)
2. Check network tab in browser dev tools
3. Verify EventSource connection status

**Multiple toasts?**
- Check you don't have multiple tabs open (each tab creates a connection)
- This is expected behavior - each client gets the notification
