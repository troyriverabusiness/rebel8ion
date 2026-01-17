#!/bin/bash

# Test OSINT Webhook Script
# Sends a sample OSINT payload to the webhook endpoint
# Usage: ./test_osint_webhook.sh [server_url]

SERVER_URL="${1:-http://localhost:8000}"
ENDPOINT="$SERVER_URL/api/v1/webhook/make"

echo "🔍 Sending OSINT data to: $ENDPOINT"
echo ""

curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
  "companyProfile": {
    "name": "Cipher Technologies",
    "domain": "cipher-tech.io",
    "industry": "Cybersecurity",
    "founded": 2018,
    "headquarters": "San Francisco, CA",
    "employeeCount": "150-200",
    "revenue": "$25M - $50M",
    "description": "Enterprise security solutions provider specializing in zero-trust architecture and threat detection systems."
  },
  "techStack": [
    {"category": "Frontend", "technologies": ["React", "TypeScript", "Tailwind CSS"]},
    {"category": "Backend", "technologies": ["Node.js", "Python", "Go"]},
    {"category": "Infrastructure", "technologies": ["AWS", "Kubernetes", "Terraform"]},
    {"category": "Security", "technologies": ["Vault", "Okta", "Cloudflare"]}
  ],
  "socialMedia": [
    {"platform": "LinkedIn", "handle": "@cipher-technologies", "followers": "12.5K", "lastActive": "2 hours ago"},
    {"platform": "Twitter/X", "handle": "@CipherTechIO", "followers": "8.2K", "lastActive": "4 hours ago"}
  ],
  "keyPersonnel": [
    {"name": "Marcus Chen", "role": "CEO & Co-Founder", "email": "m.chen@cipher-tech.io", "linkedin": "/in/marcus-chen", "riskLevel": "high"},
    {"name": "Sarah Williams", "role": "CTO", "email": "s.williams@cipher-tech.io", "linkedin": "/in/sarah-williams-cto", "riskLevel": "high"}
  ],
  "vulnerabilities": [
    {"id": "VULN-001", "type": "Email Security", "severity": "high", "description": "No DMARC policy configured for primary domain", "exploitability": 85},
    {"id": "VULN-002", "type": "Social Engineering", "severity": "medium", "description": "Employee information exposed on LinkedIn", "exploitability": 70}
  ],
  "attackVectors": [
    {"id": "AV-001", "name": "Spear Phishing", "channel": "Email", "successRate": 75, "description": "Targeted email campaign impersonating vendor"},
    {"id": "AV-002", "name": "LinkedIn Social Engineering", "channel": "Social Media", "successRate": 60, "description": "Connection request with malicious payload"}
  ],
  "osintCompletionPercentage": 100
}'

echo ""
echo ""
echo "✅ OSINT webhook sent!"
echo "   Check the client UI - the OSINT Engine tab should now be populated."
