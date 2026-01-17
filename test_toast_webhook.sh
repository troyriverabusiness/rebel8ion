#!/bin/bash

# Test script to send a webhook to the server and verify toast appears in client

echo "Sending test webhook to server..."

curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test_event",
    "data": {
      "message": "Hello from webhook!",
      "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    },
    "source": "manual_test"
  }'

echo -e "\n\nWebhook sent! Check your browser for the toast notification."
