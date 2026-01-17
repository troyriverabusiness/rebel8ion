# Webhook Toast Notifications

This feature enables real-time toast notifications in the client whenever the server receives webhook data.

## How It Works

1. **Server-Side (FastAPI + SSE)**:
   - The server exposes a `/api/v1/webhook/stream` endpoint using Server-Sent Events (SSE)
   - When a webhook is received at `/api/v1/webhook/make`, the data is broadcast to all connected clients
   - Multiple clients can subscribe to the SSE stream simultaneously

2. **Client-Side (React + Sonner)**:
   - The client establishes an EventSource connection to the SSE endpoint on mount
   - When webhook data is received, it's displayed as a toast notification using Sonner
   - The toast shows the full JSON payload in a formatted code block

## Setup

### Prerequisites

Both the server and client must be running:

```bash
# Terminal 1: Start the server
cd server
python main.py

# Terminal 2: Start the client
cd client
npm run dev
```

### Testing the Webhook Toast

You can test the webhook notifications by sending a POST request to the webhook endpoint:

```bash
# Using the provided test script
./test_toast_webhook.sh

# Or manually with curl
curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test_event",
    "data": {
      "message": "Hello from webhook!",
      "timestamp": "2026-01-17T12:00:00Z"
    },
    "source": "manual_test"
  }'
```

When the webhook is received:
1. The server logs the webhook data
2. The data is broadcast via SSE to all connected clients
3. A toast notification appears in the browser with the webhook payload

## Technical Details

### Server Endpoint: `/api/v1/webhook/stream`

- **Method**: GET
- **Type**: Server-Sent Events (SSE)
- **Purpose**: Streams webhook events to connected clients in real-time
- **Features**:
  - Automatic reconnection on disconnect
  - Keep-alive messages every 30 seconds
  - Multiple concurrent client support
  - In-memory event queue (last 100 events)

### Client Implementation

The client uses React hooks and the EventSource API:

```typescript
useEffect(() => {
  const eventSource = new EventSource("http://localhost:8000/api/v1/webhook/stream");

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    toast.success("Webhook Received", {
      description: JSON.stringify(data, null, 2),
      duration: 5000,
    });
  };

  return () => eventSource.close();
}, []);
```

### Toast Library: Sonner

- Modern, minimal toast notification library
- Beautiful animations and transitions
- Customizable icons and styling
- Supports complex content (React components)

## Customization

### Changing Toast Duration

Edit the `duration` property in `App.tsx`:

```typescript
toast.success("Webhook Received", {
  description: ...,
  duration: 10000, // 10 seconds
});
```

### Customizing Toast Content

You can modify the toast content in `App.tsx` to display specific fields:

```typescript
toast.success("Webhook Received", {
  description: (
    <div>
      <p><strong>Event:</strong> {data.event_type}</p>
      <p><strong>Message:</strong> {data.data?.message}</p>
    </div>
  ),
});
```

### Styling

The Toaster component can be customized in `src/components/ui/sonner.tsx`:

```typescript
<Toaster
  theme="dark"  // "light" | "dark" | "system"
  position="bottom-right"  // Toast position
  richColors  // Enable color-coded toasts
/>
```

## Troubleshooting

### Toast Not Appearing

1. **Check server is running**: Verify the server is accessible at `http://localhost:8000`
2. **Check browser console**: Look for SSE connection errors
3. **Check server logs**: Verify webhooks are being received
4. **CORS issues**: Ensure the server CORS settings include your client origin

### Connection Drops

- SSE automatically reconnects when the connection is lost
- The server sends keep-alive messages every 30 seconds to maintain the connection
- Check your network/proxy configuration if connections frequently drop

### Multiple Toasts

If you're seeing duplicate toasts, ensure you don't have multiple EventSource connections open. The useEffect cleanup function should close the connection properly.

## Production Considerations

For production deployments, consider:

1. **Authentication**: Add authentication to the SSE endpoint
2. **Rate Limiting**: Implement rate limiting on the webhook endpoint
3. **Webhook Verification**: Add webhook signature verification (HMAC)
4. **Persistent Storage**: Store webhook events in a database instead of memory
5. **Message Queue**: Use Redis or similar for broadcasting events across multiple server instances
6. **SSL/TLS**: Use HTTPS for both server and client in production

## Files Modified/Created

- `client/src/components/ui/sonner.tsx` - Toast component
- `client/src/App.tsx` - Added SSE listener and Toaster
- `server/api/v1/routes/webhook.py` - Added SSE streaming endpoint
- `test_toast_webhook.sh` - Test script for webhook notifications
