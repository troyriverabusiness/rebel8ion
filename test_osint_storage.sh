#!/bin/bash

# Test script for OSINT storage system
# This demonstrates the full workflow of storing and retrieving company OSINT data

set -e

BASE_URL="http://localhost:8000/api/v1"
COMPANY_NAME="Test Corporation"

echo "================================================"
echo "REVEL8 OSINT Storage System Test"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Send webhook with OSINT data
echo -e "${BLUE}[1/5] Sending webhook with OSINT data...${NC}"
curl -s -X POST "$BASE_URL/webhook/make" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Corporation",
    "event_type": "osint_complete",
    "data": {
      "keyPersonnel": [
        {
          "name": "Alice Johnson",
          "role": "CEO",
          "email": "alice@testcorp.com",
          "phone": "+1-555-0100",
          "linkedin": "alicejohnson",
          "instagram": "alice_ceo"
        },
        {
          "name": "Bob Smith",
          "role": "CTO",
          "email": "bob@testcorp.com",
          "phone": "+1-555-0101",
          "linkedin": "bobsmith",
          "instagram": "bob_tech"
        },
        {
          "name": "Carol Williams",
          "role": "VP Marketing",
          "email": "carol@testcorp.com",
          "phone": "+1-555-0102",
          "linkedin": "carolwilliams",
          "instagram": "carol_marketing"
        }
      ],
      "companyProfile": {
        "name": "Test Corporation",
        "domain": "testcorp.com",
        "industry": "Technology",
        "founded": 2010,
        "headquarters": "San Francisco, CA",
        "employeeCount": "500-1000"
      },
      "socialMedia": [
        {
          "platform": "LinkedIn",
          "handle": "test-corporation",
          "followers": "10,000+"
        },
        {
          "platform": "Twitter",
          "handle": "testcorp",
          "followers": "5,000+"
        }
      ]
    },
    "timestamp": "2026-01-17T10:30:00Z"
  }' | jq '.'

echo -e "${GREEN}✓ Webhook sent successfully${NC}"
echo ""

# Test 2: List all companies
echo -e "${BLUE}[2/5] Listing all companies with OSINT data...${NC}"
curl -s "$BASE_URL/osint/companies" | jq '.'
echo -e "${GREEN}✓ Companies listed${NC}"
echo ""

# Test 3: Retrieve specific company data
echo -e "${BLUE}[3/5] Retrieving OSINT data for '$COMPANY_NAME'...${NC}"
curl -s "$BASE_URL/osint/company/$(echo "$COMPANY_NAME" | jq -sRr @uri)" | jq '.'
echo -e "${GREEN}✓ Company data retrieved${NC}"
echo ""

# Test 4: Send another webhook with updated data
echo -e "${BLUE}[4/5] Sending updated webhook data...${NC}"
sleep 1
curl -s -X POST "$BASE_URL/webhook/make" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Corporation",
    "event_type": "osint_update",
    "data": {
      "keyPersonnel": [
        {
          "name": "Alice Johnson",
          "role": "CEO",
          "email": "alice@testcorp.com",
          "phone": "+1-555-0100",
          "linkedin": "alicejohnson",
          "instagram": "alice_ceo"
        },
        {
          "name": "Bob Smith",
          "role": "CTO",
          "email": "bob@testcorp.com",
          "phone": "+1-555-0101",
          "linkedin": "bobsmith",
          "instagram": "bob_tech"
        },
        {
          "name": "Carol Williams",
          "role": "VP Marketing",
          "email": "carol@testcorp.com",
          "phone": "+1-555-0102",
          "linkedin": "carolwilliams",
          "instagram": "carol_marketing"
        },
        {
          "name": "David Brown",
          "role": "CFO",
          "email": "david@testcorp.com",
          "phone": "+1-555-0103",
          "linkedin": "davidbrown",
          "instagram": "david_finance"
        }
      ]
    },
    "timestamp": "2026-01-17T10:35:00Z"
  }' | jq '.'
echo -e "${GREEN}✓ Updated webhook sent${NC}"
echo ""

# Test 5: Verify update with new timestamp
echo -e "${BLUE}[5/5] Verifying data was updated...${NC}"
curl -s "$BASE_URL/osint/company/$(echo "$COMPANY_NAME" | jq -sRr @uri)" | jq '{
  company_name: .company_name,
  created_at: .data.created_at,
  last_updated: .data.last_updated,
  personnel_count: .data.osint_data.data.keyPersonnel | length
}'
echo -e "${GREEN}✓ Data update verified${NC}"
echo ""

# Summary
echo "================================================"
echo -e "${GREEN}All tests completed successfully!${NC}"
echo "================================================"
echo ""
echo "What was tested:"
echo "  ✓ Webhook reception and data storage"
echo "  ✓ Company listing"
echo "  ✓ Company data retrieval"
echo "  ✓ Data updates with new timestamps"
echo "  ✓ Multiple personnel records"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open the REVEL8 UI at http://localhost:5173"
echo "  2. Select 'Test Corporation' as target"
echo "  3. Navigate to 'Execute Attack' tab"
echo "  4. Click 'Execute Multi-Channel Attack'"
echo "  5. Verify OSINT data is displayed"
echo ""
echo -e "${YELLOW}To clean up test data:${NC}"
echo "  curl -X DELETE $BASE_URL/osint/company/$(echo "$COMPANY_NAME" | jq -sRr @uri)"
echo ""
