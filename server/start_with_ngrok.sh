#!/bin/bash

# Script to start the server and provide ngrok instructions

echo "================================================"
echo "Revel8 Server - Webhook Setup with ngrok"
echo "================================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null
then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "Install ngrok with:"
    echo "  brew install ngrok"
    echo ""
    echo "Or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""
echo "Starting server on port 8000..."
echo ""
echo "To expose this server to the internet:"
echo "1. Open a NEW terminal window"
echo "2. Run: ngrok http 8000"
echo "3. Copy the 'Forwarding' HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "4. In Make.com, use: https://YOUR-NGROK-URL/api/v1/webhook/make"
echo ""
echo "================================================"
echo ""

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
