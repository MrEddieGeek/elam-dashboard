# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ELAM Fleet Management System** - Real-time fleet tracking and management dashboard for 18 logistics units (T-001 to T-018) using Wialon GPS integration, n8n automation workflows, Google Sheets as a database, and a React dashboard.

**Location**: Lázaro Cárdenas, Michoacán, Mexico
**Client**: ELAM Logistics

## Core Architecture

### Data Flow

```
Wialon GPS Platform
    ↓
    ├── Telemetry (every 3h) → n8n Workflow #1 → Google Sheets (live_data)
    └── Events (real-time) → n8n Workflow #2 (Webhook) → Google Sheets (status_operativo, eventos_log)
        ↓
Google Sheets (Public API)
    ↓
React Dashboard (auto-refresh every 2 min)
```

### Google Sheets Database Structure

The system uses a single Google Sheets document with multiple sheets:

- **status_operativo** - Real-time operational status (used by dashboard)
- **geocercas** - Geofence definitions with entry/exit rules (234+ configured)
- **live_data** - GPS telemetry data (updated every 3 hours)
- **eventos_log** - Historical event log
- **unidades_operadores** - Driver assignments
- **mantenimientos** - Maintenance schedule (created, pending integration)
- **costos_ingresos** - Cost/revenue tracking (created, pending automation)

### n8n Workflows

1. **"ELAM - Wialon to Sheets (cada 3h)"** - Polls Wialon API every 3 hours for GPS telemetry (location, speed, fuel, odometer) and updates live_data sheet
2. **"ELAM - Telegram Listener v2"** - Webhook that receives real-time geofence entry/exit events from Wialon and updates status_operativo
3. **"ELAM - Geocercas Sync"** - Syncs geofence definitions from Wialon to Google Sheets every 6 hours

All workflow JSON files are in `n8n_workflows/` directory.

### React Dashboard Architecture

**Single-page application** with no routing. Main component is `src/App.jsx` which:

1. Fetches data from Google Sheets public JSON API every 2 minutes
2. Parses Google's JSONP wrapper format (`google.visualization.Query.setResponse(...)`)
3. Displays KPI cards, filters, search, and data table
4. Uses Tailwind CSS (loaded via CDN in index.html)
5. Icons from lucide-react library

**No backend** - dashboard reads directly from Google Sheets public API.

## Development Commands

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev
# Opens on http://localhost:5173

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors

# Code formatting
npm run format        # Format all files
npm run format:check  # Check formatting without modifying
```

## Environment Variables

Configuration uses Vite environment variables (prefix: `VITE_`).

**Required**: Copy `.env.example` to `.env` and configure:

```bash
VITE_GOOGLE_SHEET_ID=1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
VITE_UPDATE_INTERVAL=120000  # 2 minutes in milliseconds
VITE_APP_TITLE=ELAM Dashboard
VITE_FLEET_NAME=ELAM Logistics
```

**IMPORTANT**: Never commit `.env` to version control. It's already in `.gitignore`.

## Status System

### 9 Standardized Status Categories

1. **En ruta** - On route (Blue)
2. **En puerto** - At port (Green)
3. **Descargando** - Unloading (Orange)
4. **Esperando carga** - Waiting for load (Amber)
5. **Taller** - Workshop/Major repair (Red)
6. **Mantenimiento ligero** - Light maintenance (Yellow)
7. **Descanso** - Driver rest (Gray)
8. **Pensión** - Storage/Parking (Gray)
9. **Disponible** - Available (Green)

Status updates are automatic via:
- Geofence entry/exit events (real-time via webhook)
- Telemetry sync (every 3 hours)

Color mapping logic is in `src/App.jsx:78-90` (getStatusColor function)

## Geofence System

Geofences (geocercas) define geographic boundaries with automatic status rules:

**Example configuration:**
```
PENSION LAZARO CARDENAS MICH
├─ Entry: Status="Pensión", Activity="En almacenamiento"
└─ Exit: Status="Disponible", Activity="Saliendo de pensión"
```

**Types**: Clients (GAS stations, warehouses), Pensions, Workshops, Ports, Rest areas

When a unit enters/exits a geofence, the webhook workflow automatically updates the status.

## Code Style & Quality

- **ESLint**: Configuration in `.eslintrc.cjs` (React + Prettier)
- **Prettier**: Configuration in `.prettierrc.json`
- **PropTypes**: Disabled (see ESLint config)
- **Console logs**: Only `console.warn` and `console.error` allowed

**Before committing:**
```bash
npm run lint:fix && npm run format
```

## Security Guidelines

**Critical**: Follow `N8N_SECURITY_GUIDE.md` for n8n workflow credentials.

- Store Wialon API tokens in n8n Credentials Manager (never hardcode)
- Use environment variables for all configuration
- Google Sheets are public read-only (no sensitive data)
- Webhook URL is public but validates Wialon event structure

## Key Data Parsing Logic

Google Sheets API returns JSONP wrapped in:
```javascript
/*O_o*/
google.visualization.Query.setResponse({...});
```

Parsing logic in `src/App.jsx:18-69` handles:
1. Removing JSONP wrapper
2. Extracting JSON object
3. Mapping rows to data structure
4. Error handling with user notifications

**Important**: The public Google Sheets API has rate limits (100 requests/100 seconds).

## Known Issues & Workarounds

1. **Operador column often empty**: Wialon API doesn't always return driver info. Solution: Fallback to `unidades_operadores` sheet (pending implementation)

2. **Próximo Movimiento column empty**: No automatic calculation yet. Solution: Logic defined in documentation, pending workflow update

3. **Google Sheets as database**: Not ideal for production scale. Works well for 18 units but consider real database if fleet exceeds 50 units

## Project State (November 2025)

**Core functionality**: ✅ Complete (85% overall)
- Real-time GPS tracking working
- Geofence event handling working
- Dashboard displaying operational data
- 234+ geofences configured

**Pending work**:
- Auto-populate Operador and Próximo Movimiento fields
- Maintenance alert automation
- Cost tracking automation

See `ELAM_Project_Documentation.md` for complete project status and roadmap.

## File Structure

```
elam-dashboard/
├── src/
│   ├── App.jsx          # Main dashboard component (single component app)
│   └── main.jsx         # React entry point
├── n8n_workflows/       # n8n workflow JSON exports
│   ├── ELAM - Wialon to Sheets (cada 3h).json
│   ├── ELAM_-_Telegram_Listener_v2_FIXED.json
│   ├── sync_geocercas_workflow.json
│   └── GEOCERCAS_SYNC_README.md
├── templates/           # CSV templates for Google Sheets
├── csv/                 # CSV data files
├── index.html           # Loads Tailwind CSS via CDN
├── vite.config.js       # Vite configuration (React plugin)
├── package.json         # Dependencies and scripts
├── .env.example         # Environment variable template
└── Documentation files  # ELAM_Project_Documentation.md, SETUP_GUIDE.md, etc.
```

## Making Changes

### Adding a new status type
1. Update status definitions in Google Sheets `status_operativo`
2. Add color mapping in `src/App.jsx:getStatusColor()`
3. Add icon mapping in `src/App.jsx:getStatusIcon()`
4. Update geofence rules if needed

### Modifying data refresh interval
- Change `VITE_UPDATE_INTERVAL` in `.env`
- Minimum recommended: 60000 (1 minute)
- Default: 120000 (2 minutes)

### Adding new workflow
1. Create workflow in n8n Cloud
2. Test thoroughly with manual execution
3. Export workflow JSON (credentials are automatically excluded)
4. Save to `n8n_workflows/` with descriptive name
5. Document in workflow README if complex

### Updating geofences
- Option 1: Add/modify in Wialon (auto-syncs every 6 hours)
- Option 2: Manually edit `geocercas` sheet in Google Sheets

## Testing

**Dashboard:**
```bash
npm run dev
# Verify:
# - Data loads from Google Sheets
# - KPI cards calculate correctly
# - Filters work
# - Search works
# - Status colors display correctly
```

**Workflows:**
- Test in n8n Cloud using "Execute Workflow" button
- Check Google Sheets for updated data
- Verify webhook with test events from Wialon

## Deployment

Dashboard can be deployed to:
- Vercel
- Netlify
- Render
- Any static hosting service

**Build command**: `npm run build`
**Output directory**: `dist/`

Set environment variables in hosting platform settings.

## Wialon API Notes

- **Authentication**: Token-based (stored in n8n credentials)
- **Base URL**: `https://hst-api.wialon.com/wialon/ajax.html`
- **Units endpoint**: `core/search_items` with `itemsType: "avl_unit"`
- **Flags parameter**: `1025` = basic data, `1281` = includes driver info (test this)
- **Session management**: Login → Get token → Make requests → Logout

Full Wialon API docs: https://sdk.wialon.com/wiki/en/

## Critical Files

- `src/App.jsx` - All dashboard logic
- `.env` - Configuration (never commit)
- `n8n_workflows/*.json` - Automation workflows
- `ELAM_Project_Documentation.md` - Complete project context
- `SETUP_GUIDE.md` - Setup and security instructions
