#!/bin/bash

# Test script for webhook endpoint

echo "================================================"
echo "Testing Revel8 Webhook Endpoint"
echo "================================================"
echo ""

# Check if argument provided (ngrok URL)
if [ -z "$1" ]; then
    echo "Usage:"
    echo "  ./test_webhook.sh [URL]"
    echo ""
    echo "Examples:"
    echo "  ./test_webhook.sh http://localhost:8000                    (local testing)"
    echo "  ./test_webhook.sh https://abc123.ngrok.io                  (ngrok testing)"
    echo ""
    exit 1
fi

BASE_URL=$1

echo "Testing URL: $BASE_URL"
echo ""

# Test 1: Check webhook status
echo "1️⃣  Checking webhook status..."
STATUS_RESPONSE=$(curl -s "$BASE_URL/api/v1/webhook/status")
echo "   Response: $STATUS_RESPONSE"
echo ""

# Test 2: Send test webhook
echo "2️⃣  Sending test webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/webhook/make" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test",
    "data": {
      "message": "Test from Mac",
      "source": "test_webhook.sh",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')

echo "   Response: $WEBHOOK_RESPONSE"
echo ""

# Test 3: Verify endpoint
echo "3️⃣  Testing verification endpoint..."
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/webhook/make/verify")
echo "   Response: $VERIFY_RESPONSE"
echo ""

echo "================================================"
echo "✅ All tests completed!"
echo "================================================"
echo ""
echo "Check your server logs to see the received webhook data."
echo ""
