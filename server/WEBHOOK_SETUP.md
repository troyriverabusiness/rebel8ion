# Webhook Setup for Make.com Integration

## Overview
The Revel8 server includes webhook endpoints to receive data from Make.com (formerly Integromat) automation workflows.

## Webhook Endpoints

### Main Webhook Endpoint
**URL:** `http://your-server:8000/api/v1/webhook/make`  
**Method:** `POST`  
**Content-Type:** `application/json`

This endpoint receives JSON payloads from Make automation scenarios.

### Verification Endpoint
**URL:** `http://your-server:8000/api/v1/webhook/make/verify`  
**Method:** `POST`  
**Content-Type:** `application/json`

Used for webhook verification during Make.com setup.

### Status Check Endpoint
**URL:** `http://your-server:8000/api/v1/webhook/status`  
**Method:** `GET`

Check if the webhook endpoint is active and ready to receive data.

## Setup Instructions

### 1. Start the Server
```bash
cd server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Configure Make.com Webhook

1. **Create a new scenario** in Make.com
2. **Add a Webhook module** (choose "Webhooks" → "Custom webhook")
3. **Create a new webhook** with these settings:
   - **Webhook name:** Revel8 Webhook
   - **URL:** `http://your-server-ip:8000/api/v1/webhook/make`
   - **Method:** POST
   - **Data structure:** JSON

4. **Test the webhook** by sending sample data from Make

### 3. Send Data Format

The webhook accepts any JSON payload. Here's a recommended format:

```json
{
  "event_type": "your_event_type",
  "timestamp": "2026-01-17T12:00:00Z",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### 4. Expected Response

On success, the webhook returns:

```json
{
  "status": "success",
  "message": "Webhook received successfully",
  "received_data": {
    // your original payload echoed back
  }
}
```

## Testing the Webhook

### Using curl
```bash
curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test",
    "data": {"message": "Hello from Make"},
    "timestamp": "2026-01-17T12:00:00Z"
  }'
```

### Using Make.com Test Feature
1. In your Make scenario, click **"Run once"**
2. Trigger your scenario
3. Check the server logs to see the received data

## Monitoring

The webhook logs all received data to the server console. You can view logs by:

```bash
# View server logs in real-time
tail -f server.log
```

Or check the console output where uvicorn is running.

## Security Considerations

For production use, consider adding:

1. **Webhook signature verification** - Validate requests come from Make.com
2. **API key authentication** - Require an API key in headers
3. **Rate limiting** - Prevent abuse
4. **HTTPS** - Use SSL/TLS for encrypted communication
5. **IP whitelisting** - Only allow requests from Make.com IPs

### Example with API Key (Future Enhancement)
```python
from fastapi import Header, HTTPException

@router.post("/webhook/make")
async def receive_make_webhook(
    request: Request,
    x_api_key: str = Header(None)
):
    if x_api_key != "your-secret-key":
        raise HTTPException(status_code=401, detail="Invalid API key")
    # ... rest of the code
```

## Troubleshooting

### Webhook not receiving data
- Check that the server is running and accessible
- Verify the URL in Make.com matches your server
- Check firewall rules allow incoming connections on port 8000
- Review server logs for error messages

### Connection timeout
- Ensure your server is publicly accessible (or use ngrok for testing)
- Check network connectivity
- Verify port 8000 is open

### Invalid JSON error
- Ensure Make.com is sending valid JSON
- Check Content-Type header is set to `application/json`

## Example Make.com Scenarios

### 1. Email to Webhook
- Trigger: New email received
- Action: Send email data to webhook
- Use case: Process incoming emails automatically

### 2. Scheduled Data Collection
- Trigger: Schedule (every hour)
- Actions: Fetch data from APIs → Send to webhook
- Use case: Regular data updates

### 3. Multi-step Automation
- Trigger: HTTP webhook
- Actions: Process data → Call external APIs → Send results to webhook
- Use case: Complex workflow automation

## Next Steps

After setting up the webhook, you can:
1. Add custom processing logic in `webhook.py`
2. Store received data in a database
3. Trigger other actions based on webhook data
4. Send responses back to Make.com for further processing
