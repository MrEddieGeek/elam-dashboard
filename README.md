# 🚛 ELAM Logistics Dashboard

**Real-time fleet management system** for transportation logistics with automated tracking, geofence monitoring, and operational analytics.

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-purple)](https://vitejs.dev/)
[![n8n](https://img.shields.io/badge/n8n-Workflow_Automation-orange)](https://n8n.io/)
[![Python](https://img.shields.io/badge/Python-3.10+-green)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

ELAM Dashboard is a comprehensive fleet management solution that provides:
- **Real-time GPS tracking** for 18 tractocamiones (T-001 to T-018)
- **Automated status updates** via geofence entry/exit events
- **Operational dashboard** with KPIs and unit status
- **Event logging** and audit trail
- **Cost tracking** and maintenance scheduling
- **n8n workflow automation** for data synchronization

### Live Demo
- **Dashboard:** [https://elam-dashboard.onrender.com](https://elam-dashboard.onrender.com)
- **Google Sheets Data:** Contact for access

---

## ✨ Features

### Core Dashboard
- 📊 **Real-time KPIs:** Total units, En Ruta, En Taller, Disponible, Descargando, En Movimiento
- 🗺️ **Live Telemetry:** GPS coordinates, speed, fuel, odometer
- 👤 **Operator Tracking:** Automated driver assignment
- 📍 **Geofence Management:** 298 geocercas (talleres, casetas, puertos, clientes)
- 🔔 **Event Notifications:** Entry/exit alerts via Telegram
- 📝 **Complete Audit Trail:** All status changes logged with before/after states
- 🚦 **Route Completion Tracking:** Auto-detect route start/completion, weekly counter per unit

### Automation
- ⏰ **Every 3 hours:** Telemetry sync from Wialon API
- 🔄 **Real-time:** Geofence events via webhook
- 🤖 **Auto-calculation:** Next expected movement based on current status
- 📊 **Data Pipeline:** Wialon → n8n → Google Sheets → React Dashboard

### Data Management
- 10 Google Sheets tabs for different data types
- Automated geocerca import from KML files
- Python scripts for data processing
- CSV templates for manual data entry

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite 4.3** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend/Automation
- **n8n Cloud** - Workflow automation (5,000 executions/month free tier)
- **Wialon API** - GPS tracking platform
- **Google Sheets API** - Data storage
- **Python 3.10+** - Data processing scripts

### Infrastructure
- **Render** - Frontend hosting (free tier)
- **Google Cloud** - Service account for Sheets API
- **Telegram Bot** - Notifications

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.10+
- Google Cloud Service Account with Sheets API enabled
- n8n Cloud account (or self-hosted)
- Wialon API access

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/elam-dashboard.git
cd elam-dashboard
```

2. **Install dependencies:**
```bash
# Frontend
npm install

# Python
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your Google Sheet ID
```

4. **Set up credentials:**
```bash
mkdir -p credentials
# Place your service-account.json in credentials/ directory
# Share your Google Sheet with the service account email
```

5. **Run development server:**
```bash
npm run dev
```

6. **Import geocercas (one-time):**
```bash
python3 scripts/import_geocercas.py
```

7. **Import n8n workflows:**
- Go to n8n Cloud
- Import workflows from `workflows/` directory
- Configure credentials
- Activate workflows

📖 **Full setup guide:** See [SETUP_GUIDE.md](docs/setup/SETUP_GUIDE.md)

---

## 📚 Documentation

### 👋 Start Here
- **[Spanish Client Brief](docs/RESUMEN_CLIENTE.md)** - Executive summary for client presentations (Spanish) 🆕
- **[Complete Project Docs](docs/project/ELAM_Project_Documentation.md)** - Comprehensive project overview
- **[Development History](docs/project/DEVELOPMENT_HISTORY.md)** - Timeline and development phases 🆕

### 🚀 Getting Started
- **[Setup Guide](docs/setup/SETUP_GUIDE.md)** - Complete installation instructions
- **[Deployment Guide](docs/setup/DEPLOYMENT_GUIDE.md)** - Deploy to production

### 📖 Technical Guides
- **[Architecture Diagrams](docs/technical/ARCHITECTURE_DIAGRAM.md)** - System architecture with Mermaid diagrams 🆕
- **[Push Notifications Plan](docs/technical/PUSH_NOTIFICATIONS_PLAN.md)** - SSE implementation (fully planned) 🆕
- **[Route Tracking Logic](docs/guides/ROUTE_TRACKING_LOGIC.md)** - How any-unit-any-route system works
- **[Route Tracking Setup](docs/guides/route-tracking-setup.md)** - Configure route completion tracking
- **[Geocercas Sync Guide](docs/guides/GEOCERCAS_SYNC_GUIDE.md)** - Geofence import & updates
- **[Wialon Puerto Setup](docs/guides/WIALON_PUERTO_SETUP_GUIDE.md)** - Configure port notifications
- **[n8n Security Guide](docs/guides/N8N_SECURITY_GUIDE.md)** - Security best practices

### ✅ Checklists
- **[Puerto Notifications Checklist](docs/checklists/PUERTO_NOTIFICATIONS_CHECKLIST.md)** - Testing checklist
- **[GitHub Upload Checklist](docs/checklists/GITHUB_UPLOAD_CHECKLIST.md)** - Pre-commit security checks

### 📂 Project Documentation
- **[Fixes Summary](docs/project/FIXES_SUMMARY.md)** - Recent bug fixes and changes
- **[GitHub Preparation](docs/project/GITHUB_PREPARATION_SUMMARY.md)** - Repository setup notes

### 🤖 Telegram Bot Documentation
- **[Implementation Tracker](dispatch/IMPLEMENTATION_TRACKER.md)** - 5-phase implementation roadmap with status
- **[Phase 2 Complete](dispatch/README_PHASE_2_COMPLETE.md)** - Driver bot features
- See `dispatch/` folder for detailed bot documentation (11 files)

### 🔧 Workflow Documentation
- **[Workflow Quick Setup](workflows/QUICK_SETUP.md)** - n8n quick setup
- **[Geocercas Sync README](workflows/GEOCERCAS_SYNC_README.md)** - Geofence workflow details

### 📦 Archive
- **[Session Summaries](docs/archive/)** - Historical development session notes

---

## 📁 Project Structure

```
elam-dashboard/
├── src/
│   ├── App.jsx                 # Main React component
│   └── main.jsx                # Entry point
│
├── docs/                       # 📚 All documentation
│   ├── CLAUDE.md               # AI assistant context
│   ├── RESUMEN_CLIENTE.md      # Spanish client brief (NEW)
│   ├── setup/                  # Setup and deployment guides
│   ├── guides/                 # Technical guides (7 files)
│   ├── checklists/             # Testing and validation
│   ├── project/                # Project documentation
│   │   ├── ELAM_Project_Documentation.md
│   │   ├── DEVELOPMENT_HISTORY.md  # Development timeline (NEW)
│   │   ├── FIXES_SUMMARY.md
│   │   └── GITHUB_PREPARATION_SUMMARY.md
│   ├── technical/              # Technical implementation docs (NEW)
│   │   ├── ARCHITECTURE_DIAGRAM.md  # Mermaid diagrams
│   │   └── PUSH_NOTIFICATIONS_PLAN.md  # SSE implementation
│   └── archive/                # Historical session notes (NEW)
│
├── dispatch/                   # Telegram bot documentation (11 files)
│   ├── IMPLEMENTATION_TRACKER.md  # 5-phase roadmap with status
│   ├── PHASE_1_START_HERE.md
│   ├── PHASE_2_IMPORT_GUIDE.md
│   └── ... (implementation guides)
│
├── workflows/                  # Automation workflows (n8n)
│   ├── ELAM_-_Telegram_Listener_v3_WITH_ROUTE_TRACKING.json  # Event handler with route tracking
│   ├── ELAM_-_Weekly_Route_Counter_Reset.json     # Weekly counter reset (Mondays)
│   ├── ELAM - Wialon to Sheets (cada 3h).json     # Telemetry sync
│   ├── ELAM - Complete Sync (Units + Geocercas).json
│   ├── QUICK_SETUP.md          # n8n quick setup
│   └── GEOCERCAS_SYNC_README.md
│
├── scripts/                    # Python automation scripts
│   ├── import_geocercas.py     # KML → Google Sheets importer
│   └── test_kml_parsing.py     # KML parser tests
│
├── templates/                  # CSV templates for data entry
│   ├── template_geocercas_completo.csv
│   ├── template_mantenimientos.csv
│   ├── wialon_puerto_notifications.csv
│   └── ... (8 templates total)
│
├── credentials/                # 🔒 NOT COMMITTED (gitignored)
│   └── service-account.json    # Google Cloud credentials
│
├── csv/                        # Data files (gitignored)
│   ├── Geofences(1).kml        # Wialon export (1.1MB, 298 geofences)
│   └── *.csv                   # Various data exports
│
├── .env                        # 🔒 NOT COMMITTED (gitignored)
├── .env.example                # Environment template
├── package.json                # Node dependencies
├── requirements.txt            # Python dependencies
├── vite.config.js              # Build configuration
└── README.md                   # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Google Sheets Configuration
VITE_GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SHEET_ID=your_google_sheet_id_here  # For Python scripts

# Dashboard Settings
VITE_UPDATE_INTERVAL=120000  # 2 minutes in milliseconds
VITE_APP_TITLE=ELAM Dashboard
VITE_FLEET_NAME=ELAM Logistics
```

### Google Sheets Structure

The system uses 10 sheets:

| Sheet Name | Purpose | Status |
|------------|---------|--------|
| status_operativo | Current unit status | ✅ Active |
| live_data | Telemetry data | ✅ Active |
| geocercas | Geofence catalog | ✅ Active (298 entries) |
| unidades_operadores | Driver assignments | ✅ Active (18 drivers) |
| eventos_log | Event audit trail | ✅ Active |
| mapeo_status | Status mapping rules | ✅ Active |
| parametros_costos | Cost parameters | ✅ Active |
| costos_ingresos | Cost tracking | ⚠️ Partial |
| mantenimientos | Maintenance log | 📋 Template ready |
| rutas_programadas | Route planning | 📋 Template ready |

### n8n Workflows

3 main workflows:

1. **Telemetry Sync** - Every 3 hours
   - Fetches unit data from Wialon API
   - Updates `live_data` sheet
   - 18 units × 8 updates/day = ~4,300 executions/month

2. **Event Listener** - Real-time webhook
   - Receives geofence entry/exit events
   - Updates `status_operativo` and `eventos_log`
   - Looks up operator and calculates next movement
   - ~50-100 events/day

3. **Complete Sync** - Every 6 hours (optional)
   - Combines units + geocercas sync
   - Keeps geofence data updated

---

## 🚢 Deployment

### Frontend (Render)

1. Connect GitHub repository to Render
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Add environment variables in Render dashboard
5. Deploy!

**Live URL:** https://elam-dashboard.onrender.com

### n8n Workflows

1. Sign up for n8n Cloud (free tier)
2. Import workflow JSONs from `workflows/`
3. Configure Google Sheets credential
4. Set environment variables (Sheet ID, Wialon token)
5. Activate workflows

📖 **Full deployment guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🧪 Testing

### Run Tests

```bash
# Test KML parsing
python3 scripts/test_kml_parsing.py

# Test geocerca import (dry run)
python3 scripts/import_geocercas.py --dry-run

# Lint frontend code
npm run lint

# Format code
npm run format
```

### Test n8n Workflows

```bash
# Send test webhook
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-001",
    "evento": "entrada_geocerca",
    "geocerca": "TALLER QUINTANAR TQPQ JAL",
    "velocidad": "0"
  }'
```

---

## 📊 System Architecture

```
┌─────────────────┐
│   WIALON API    │ (GPS Tracking Platform)
│  hst-api.w.com  │
└────────┬────────┘
         │
         ├─── Every 3h: Telemetry data
         └─── Real-time: Geofence events
                  │
                  ↓
         ┌────────────────┐
         │      n8n       │ (Workflow Automation)
         │  Cloud/Self    │
         └────────┬───────┘
                  │
                  ├─── Parse & process data
                  ├─── Lookup operators
                  └─── Calculate next movement
                          │
                          ↓
                 ┌────────────────┐
                 │ GOOGLE SHEETS  │ (Data Storage)
                 │   10 Sheets    │
                 └────────┬───────┘
                          │
                          ↓
                 ┌────────────────┐
                 │ React Dashboard│ (Frontend)
                 │   Render.com   │
                 └────────────────┘
```

---

## 🔒 Security

**IMPORTANT:** Never commit sensitive data!

### Protected Files (gitignored):
- ✅ `credentials/service-account.json` - Google Cloud private key
- ✅ `.env` - Environment variables with Sheet ID
- ✅ `csv/*.xlsx`, `csv/*.kml` - Business data exports
- ✅ `node_modules/` - Dependencies

### Security Best Practices:
1. Use environment variables for all secrets
2. Store credentials in n8n Cloud (encrypted)
3. Never hardcode API tokens in workflows
4. Use Google Service Account (not personal OAuth)
5. Limit Sheet sharing to service account only

📖 **Full security guide:** [N8N_SECURITY_GUIDE.md](N8N_SECURITY_GUIDE.md)

---

## 🗺️ Roadmap

### ✅ Completed (v2.0)
- [x] Real-time dashboard with KPIs
- [x] Telemetry sync from Wialon
- [x] Geofence event automation
- [x] Operator tracking
- [x] Event logging
- [x] 298 geocercas imported
- [x] "Próximo Movimiento" auto-calculation
- [x] Complete audit trail

### 🚧 In Progress
- [ ] Maintenance alerts workflow
- [ ] Cost tracking automation

### 📋 Planned (Future)
- [ ] Route planning module
- [ ] ML-based predictive maintenance
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-company support
- [ ] Route optimization AI

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style
- Frontend: ESLint + Prettier (run `npm run lint` and `npm run format`)
- Python: PEP 8 (run `black` formatter)
- Commit messages: Conventional Commits format

---

## 📝 License

This project is proprietary software developed for ELAM Logistics.

**© 2025 ELAM Logistics. All rights reserved.**

---

## 👥 Team

- **Project Lead:** ELAM Logistics Operations
- **Development:** Built with assistance from Claude Code
- **Infrastructure:** n8n Cloud, Render, Google Cloud

---

## 📞 Support

### Documentation
- Check the [documentation](#documentation) section above
- Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation help
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues

### Issues
- Report bugs via GitHub Issues
- Include execution logs from n8n
- Provide screenshot if dashboard-related

### Contact
- **Email:** support@elam-logistics.com (if applicable)
- **Location:** Zapopan, Jalisco, México

---

## 🙏 Acknowledgments

- **Wialon** - GPS tracking platform
- **n8n** - Workflow automation
- **Google Sheets** - Data storage
- **Render** - Frontend hosting
- **React + Vite** - Frontend framework
- **Tailwind CSS** - UI styling

---

## 📊 Statistics

- **18 Units** actively tracked
- **298 Geofences** configured
- **~4,300 telemetry updates** per month
- **~1,500 geofence events** per month
- **10 Google Sheets** for data management
- **3 n8n workflows** for automation
- **100% uptime** target

---

**Built with ❤️ for efficient fleet management**

---

## 🔄 Version History

### v2.0.0 (2025-11-11) - Current
- ✅ Complete operator tracking
- ✅ "Próximo Movimiento" auto-calculation
- ✅ Full event audit trail with before/after states
- ✅ 298 geocercas imported from KML
- ✅ Enhanced webhook parser for Wialon format
- ✅ All dashboard columns functional

### v1.0.0 (2025-10-31)
- ✅ Initial dashboard release
- ✅ Basic telemetry sync
- ✅ Geofence event handling
- ✅ Manual operator assignment

---

**Last Updated:** November 11, 2025
**Status:** Production Ready ✅
**Deployment:** https://elam-dashboard.onrender.com
