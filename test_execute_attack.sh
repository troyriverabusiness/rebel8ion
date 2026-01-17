#!/bin/bash

# Test script for the execute attack endpoint

echo "🎯 Testing Execute Attack Endpoint"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check webhook configuration
echo "📋 Test 1: Check webhook configuration"
echo "--------------------------------------"
curl -s -X GET http://localhost:8000/api/v1/attack/webhook-config | jq '.'
echo ""
echo ""

# Test 2: Execute attack on a company (Cipher)
echo "🚀 Test 2: Execute attack on Cipher Technologies"
echo "-------------------------------------------------"
curl -s -X POST http://localhost:8000/api/v1/attack/execute \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Cipher"
  }' | jq '.'
echo ""
echo ""

# Test 3: Try to execute attack on non-existent company
echo "❌ Test 3: Execute attack on non-existent company (should fail)"
echo "---------------------------------------------------------------"
curl -s -X POST http://localhost:8000/api/v1/attack/execute \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "NonExistentCompany"
  }' | jq '.'
echo ""
echo ""

# Test 4: Execute attack on another company (Vector)
echo "🚀 Test 4: Execute attack on Vector Financial"
echo "----------------------------------------------"
curl -s -X POST http://localhost:8000/api/v1/attack/execute \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Vector"
  }' | jq '.'
echo ""
echo ""

echo "✅ Attack endpoint tests complete!"
echo ""
echo "${YELLOW}NOTE: The webhook URL is currently set to a placeholder.${NC}"
echo "${YELLOW}Update WEBHOOK_URL in server/api/v1/routes/attack.py${NC}"
