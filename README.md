# Revel8

> A sophisticated OSINT reconnaissance and social engineering platform for security research and penetration testing

---

## Quick Start (TL;DR)

### Kill Existing Processes
```bash
# Kill backend (port 8000)
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Kill frontend (port 5173)
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Kill ngrok (if running)
pkill ngrok 2>/dev/null
```

### Development Mode
```bash
# Terminal 1: Backend
cd server && source .venv/bin/activate && uv run python main.py

# Terminal 2: Frontend
cd client && npm run dev
```
Open `http://localhost:5173`

### Production Mode (with Voice Agent via ngrok)

**Prerequisites:** `brew install ngrok` and sign up at ngrok.com

```bash
# Terminal 1: Frontend
cd client && npm run dev

# Terminal 2: ngrok tunnel
ngrok http 5173
# Copy the HTTPS URL (e.g., https://xxx.ngrok-free.app)

# Terminal 3: Update backend config and start
cd server
# Edit .env: AGENT_WEBPAGE_URL=https://xxx.ngrok-free.app/agent
source .venv/bin/activate && uv run python main.py
```

**Test Voice Agent:**
1. Open `http://localhost:5173`
2. Select target → "Penetrate"
3. Go to "Google Meet Attack" tab
4. Create a Google Meet, paste URL, click "Start Voice Agent"

---

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-19.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)](https://fastapi.tiangolo.com/)

## 🔍 Overview

**Revel8** is an advanced OSINT (Open Source Intelligence) reconnaissance platform designed for security researchers and penetration testers. It automates the process of gathering intelligence on target organizations, identifying vulnerabilities, and orchestrating sophisticated social engineering attacks through real-time webhook integrations.

### Key Features

- 🎯 **Automated Target Intelligence Gathering** - Collect comprehensive data on target organizations including company profiles, tech stacks, and key personnel
- 🕵️ **OSINT Engine** - Automated reconnaissance that gathers publicly available information from multiple sources
- 💾 **Company-Specific Data Storage** - In-memory storage system that organizes OSINT data by company for easy retrieval during attack execution
- 👥 **Personnel Profiling** - Identify high-value targets within organizations with risk assessment
- 🔓 **Vulnerability Detection** - Discover security weaknesses and potential attack vectors
- 📧 **Google Meet Attack Orchestration** - Sophisticated social engineering campaign management
- 🔔 **Real-time Webhook Integration** - Live notifications and event streaming via Server-Sent Events (SSE)
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 🔌 **Make.com Integration** - Seamless automation workflow support

## 🏗️ Architecture

Revel8 is built with a modern, containerized architecture:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  React Client (Port 5173/3000)                  │
│  - Modern UI with Tailwind CSS                  │
│  - Real-time SSE connection                     │
│  - Toast notifications                          │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP/SSE
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  FastAPI Server (Port 8000)                     │
│  - REST API endpoints                           │
│  - SSE event streaming                          │
│  - Webhook processing                           │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ Webhooks
                 │
┌────────────────▼────────────────────────────────┐
│                                                 │
│  External Integrations                          │
│  - Make.com automation                          │
│  - Clearbit company search                      │
│  - Ngrok tunneling (development)                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.2 with TypeScript
- Vite for blazing-fast development
- Tailwind CSS 4.x for styling
- Radix UI components
- Sonner for toast notifications
- Three.js for 3D visualizations

**Backend:**
- Python 3.9+
- FastAPI for high-performance API
- Uvicorn ASGI server
- httpx for async HTTP requests
- Server-Sent Events (SSE) for real-time updates

**Infrastructure:**
- Docker & Docker Compose
- Ngrok for webhook tunneling
- Make.com for automation workflows

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** with `uv` package manager
- **Node.js 18+** and npm
- **Docker** (optional, for containerized deployment)
- **Make.com account** (for webhook integrations)
- **Ngrok account** (optional, for remote webhooks)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/revel8.git
   cd revel8
   ```

2. **Start the backend server:**
   ```bash
   cd server
   uv run python main.py
   ```
   The server will start on `http://localhost:8000`

3. **Start the frontend client** (in a new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The client will start on `http://localhost:5173`

4. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`

### Docker Deployment

For production deployment using Docker:

```bash
docker compose up -d
```

This will start both the client (port 3000) and server (port 8000) in containers.

## 📖 Usage

### 1. Target Selection

1. Navigate to the home page
2. Search for a target company using the intelligent search powered by Clearbit
3. Select your target organization
4. The system will automatically trigger the OSINT engine

### 2. Dashboard Overview

Once a target is selected, you'll access the main dashboard with four key tabs:

#### **Overview Tab**
- Real-time OSINT progress tracking
- Company profile summary
- Quick stats on vulnerabilities and attack vectors
- Completion percentage

#### **OSINT Engine Tab**
- **Company Profile**: Detailed organization information (industry, revenue, employee count)
- **Technology Stack**: Infrastructure and software technologies in use
- **Social Media Presence**: Active social platforms and engagement metrics
- **Key Personnel**: High-value targets with risk levels and contact information
- **Vulnerabilities**: Security weaknesses with severity ratings and exploitability scores
- **Attack Vectors**: Identified attack channels with success rate predictions

#### **Google Meet Attack Tab**
- Configure social engineering campaigns
- Target selection from identified personnel
- Attack timing and parameters
- Real-time execution monitoring

#### **Execute Attack Tab**
- Launch configured attacks
- Monitor campaign progress
- View success/failure metrics
- Collect response data

### 3. Webhook Integration

Revel8 uses real-time webhooks for seamless integration with external automation platforms:

**Testing webhooks:**
```bash
# Or use curl
curl -X POST http://localhost:8000/api/v1/webhook/make \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "osint_complete",
    "data": {"target": "Company Inc"},
    "source": "make.com"
  }'
```

**Real-time notifications:**
- All webhook events appear as toast notifications in the UI
- Events are streamed via SSE for instant updates
- Supports multiple simultaneous connections

## 🔧 Configuration

### Backend Configuration

The server exposes the following environment variables:

```bash
# Server settings
HOST=0.0.0.0
PORT=8000

# Make.com webhook URL (configured in server/api/v1/routes/target.py)
WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-id
```

### Frontend Configuration

CORS origins are configured in `server/main.py`:

```python
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

### Ngrok Setup (Optional)

For exposing your local server to external webhooks:

```bash
cd server
./start_with_ngrok.sh
```

See `server/MAC_WEBHOOK_GUIDE.md` for detailed instructions.

## 📡 API Reference

### Health Check
```
GET /api/v1/health
```
Returns server health status.

### Company Search
```
GET /api/v1/companies/search?query={company_name}
```
Search for companies via Clearbit API proxy.

### Target Selection
```
POST /api/v1/target/select
Body: {"company_name": "Company Inc"}
```
Submit a target company for OSINT analysis.

### Webhook Receiver
```
POST /api/v1/webhook/make
Body: {
  "company_name": "Target Corp",
  "event_type": "osint_complete",
  "data": {...},
  "timestamp": "2026-01-17T10:30:00Z"
}
```
Receive webhook events from external sources. Automatically stores OSINT data in memory by company name.

### SSE Event Stream
```
GET /api/v1/webhook/stream
```
Establish Server-Sent Events connection for real-time updates.

### Webhook Status
```
GET /api/v1/webhook/status
```
Check webhook system status and connected clients.

### OSINT Data Storage

```
GET /api/v1/osint/companies
```
List all companies with stored OSINT data.

```
GET /api/v1/osint/company/{company_name}
```
Retrieve stored OSINT data for a specific company.

```
DELETE /api/v1/osint/company/{company_name}
```
Delete stored OSINT data for a specific company.

> **Note:** OSINT data is stored in-memory and persists only while the server is running. See [OSINT_STORAGE.md](OSINT_STORAGE.md) for detailed documentation.

## 🧪 Testing

### Backend Tests
```bash
cd server
./test_webhook.sh
```

### Frontend Tests
```bash
cd client
npm run lint
```

### End-to-End Webhook Test
```bash
# Test toast notifications webhook
./test_toast_webhook.sh

# Test OSINT storage system
./test_osint_storage.sh
```

## 📚 Documentation

- **[Architecture Flow](ARCHITECTURE_FLOW.md)** - System architecture and data flow diagrams
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Feature implementation details
- **[OSINT Storage System](OSINT_STORAGE.md)** - In-memory data storage and retrieval guide
- **[Toast Notifications](TOAST_NOTIFICATIONS.md)** - Real-time notification system guide
- **[Webhook Setup Guide](server/WEBHOOK_SETUP.md)** - Comprehensive webhook configuration
- **[Mac Webhook Guide](server/MAC_WEBHOOK_GUIDE.md)** - macOS-specific webhook setup with ngrok
- **[Quick Reference](QUICK_REFERENCE.md)** - Command reference and shortcuts

## 🛡️ Security & Ethics

**⚠️ IMPORTANT DISCLAIMER:**

Revel8 is designed **exclusively** for:
- Authorized security research
- Penetration testing with explicit written permission
- Educational purposes in controlled environments
- Bug bounty programs within scope

**Unauthorized use of this tool against systems you don't own or have permission to test is ILLEGAL and UNETHICAL.**

- Always obtain written authorization before conducting any security testing
- Respect privacy and data protection laws
- Follow responsible disclosure practices
- Use only in compliance with applicable laws and regulations

The developers of Revel8 assume no liability for misuse of this tool.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Clearbit API for company search functionality
- Make.com for webhook automation
- Ngrok for secure tunneling
- The open-source community for amazing tools and libraries

## 📞 Support

For questions, issues, or feature requests:
- **Issues**: [GitHub Issues](https://github.com/yourusername/revel8/issues)
- **Documentation**: See the `/docs` folder for detailed guides
- **Community**: Join our discussions

---

**Built with ❤️ for security researchers and ethical hackers**

*Remember: With great power comes great responsibility. Use wisely.*
