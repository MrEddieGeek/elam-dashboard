# ELAM Fleet Management System - Architecture Diagrams

**Project:** ELAM Logistics Dashboard
**Version:** 2.0 (Production)
**Last Updated:** December 9, 2025

---

## Overview

This document provides visual architecture diagrams for the ELAM Fleet Management System using Mermaid syntax. These diagrams render automatically on GitHub and provide a clear understanding of the system architecture, data flows, and technology stack.

---

## Table of Contents

1. [System Architecture (Current v2.0)](#1-system-architecture-current-v20)
2. [Data Flow Sequence (Geofence Event)](#2-data-flow-sequence-geofence-event)
3. [Telegram Bot State Machine](#3-telegram-bot-state-machine-driver-bot-phase-2)
4. [Technology Stack](#4-technology-stack)
5. [Future Architecture (with SSE)](#5-future-architecture-with-sse-push-notifications)

---

## 1. System Architecture (Current v2.0)

### Purpose
Shows the complete system architecture with all major components, data flows, and update frequencies.

### Diagram

```mermaid
graph TB
    subgraph External["External Systems"]
        W[Wialon GPS API<br/>18 Units<br/>hst-api.wialon.com]
        T[Telegram Bot API<br/>@ELAMFleetConductores<br/>@ELAMFleetDespacho]
    end

    subgraph Automation["n8n Cloud Workflows<br/>elam-logistic.app.n8n.cloud"]
        N1[Telemetry Sync<br/>Every 3 hours<br/>~200 exec/month]
        N2[Event Listener<br/>Real-time Webhook<br/>~50-100 events/day]
        N3[Route Counter Reset<br/>Weekly on Monday<br/>00:00]
        N4[Driver Bot<br/>Phase 2 - 95%]
    end

    subgraph Storage["Data Layer"]
        GS[(Google Sheets<br/>ELAM_Fleet_Data<br/>10 Sheets)]
    end

    subgraph Frontend["User Interfaces"]
        D[Dashboard Web<br/>React 18 + Vite<br/>elam-dashboard.onrender.com]
        B1[Driver Bot<br/>Telegram]
        B2[Dispatcher Bot<br/>Telegram<br/>Phase 3]
    end

    subgraph Users["End Users"]
        U1[Dispatchers<br/>Web Dashboard]
        U2[Drivers<br/>18 conductores]
        U3[Management<br/>Dashboard + Reports]
    end

    W -->|Every 3h<br/>GPS, Speed, Fuel, Odometer| N1
    W -->|Real-time<br/>Geofence Entry/Exit| N2
    N1 --> |Update live_data| GS
    N2 --> |Update status_operativo<br/>Log eventos_log| GS
    N3 --> |Reset rutasSemana| GS
    T <--> N4
    N4 --> |Save pausas, incidentes<br/>emergencias| GS
    GS -->|Public JSON API<br/>Poll every 2 min| D
    D --> U1
    D --> U3
    B1 <--> U2
    B2 -.-> U1

    style W fill:#4CAF50,color:#fff
    style GS fill:#FFC107,color:#000
    style D fill:#2196F3,color:#fff
    style B1 fill:#00BCD4,color:#fff
    style B2 fill:#00BCD4,color:#fff,stroke-dasharray: 5 5
    style N4 fill:#9C27B0,color:#fff
```

### Legend
- **Solid lines:** Active data flows
- **Dashed lines:** Planned (Phase 3)
- **Colors:**
  - Green: External APIs
  - Yellow: Data storage
  - Blue: Web interfaces
  - Cyan: Telegram bots
  - Purple: In-progress features

### Key Components

**External Systems:**
- **Wialon GPS API:** Professional GPS tracking platform providing telemetry data
- **Telegram Bot API:** Messaging platform for driver/dispatcher communication

**n8n Workflows:**
- **Workflow 1 (Telemetry Sync):** Fetches GPS data every 3 hours for all 18 units
- **Workflow 2 (Event Listener):** Processes real-time geofence events via webhook
- **Workflow 3 (Route Counter):** Resets weekly trip counter every Monday
- **Workflow 4 (Driver Bot):** Handles driver interactions (pause, incidents, emergencies)

**Data Storage:**
- **Google Sheets:** 10-sheet database (status_operativo, live_data, geocercas, eventos_log, etc.)
- **Public API:** Allows dashboard to fetch data without authentication

**User Interfaces:**
- **Web Dashboard:** React-based real-time monitoring interface
- **Driver Bot:** Telegram bot for driver interactions (95% complete)
- **Dispatcher Bot:** Telegram bot for dispatcher commands (planned Phase 3)

---

## 2. Data Flow Sequence (Geofence Event)

### Purpose
Shows the detailed sequence of events when a unit enters or exits a geofence, demonstrating real-time automation.

### Diagram

```mermaid
sequenceDiagram
    participant U as Unit T-005
    participant W as Wialon GPS
    participant N as n8n Event Listener
    participant G as Google Sheets
    participant D as Dashboard
    participant Users as Dispatchers

    Note over U,W: Unit travels and crosses geofence boundary
    U->>W: GPS position update<br/>(TALLER QUINTANAR entry)

    Note over W,N: Real-time webhook (< 5 seconds)
    W->>N: POST /webhook/telegram-wialon<br/>Event: entrada_geocerca<br/>Unit: T-005<br/>Geofence: TALLER QUINTANAR

    Note over N: n8n processes event
    N->>N: Parse event data<br/>Extract: unit, geocerca, tipo

    N->>G: Read geocercas sheet<br/>Find: "TALLER QUINTANAR"
    G-->>N: Found: status_entrada = "En Taller"<br/>actividad_entrada = "En reparación"

    Note over N,G: Update operational status
    N->>G: Update status_operativo<br/>T-005: status = "En Taller"<br/>actividad = "En reparación"<br/>ubicacion = "TALLER QUINTANAR"

    N->>G: Log to eventos_log<br/>timestamp, unit, event_type,<br/>status_before, status_after

    Note over D: Dashboard polls every 2 minutes
    D->>G: GET status_operativo<br/>(Public JSON API)
    G-->>D: Return all 18 units data<br/>T-005: "En Taller"

    D->>D: Parse & update UI<br/>Show red status badge

    Note over Users: Dispatcher sees update
    D->>Users: Display: T-005 entered<br/>TALLER QUINTANAR<br/>Status: En Taller

    Note over U,Users: Total latency: ~10 seconds to 2 minutes
```

### Timing Breakdown

| Step | Component | Duration |
|------|-----------|----------|
| GPS → Wialon | Wialon GPS | ~1-3 seconds |
| Wialon → n8n Webhook | Network | ~1-2 seconds |
| n8n Processing | n8n workflow | ~3-5 seconds |
| Google Sheets Update | Sheets API | ~1-2 seconds |
| Dashboard Poll | React app | 0-120 seconds (depending on poll timing) |
| **Total Latency** | **End-to-end** | **~10 sec to 2 min** |

### Notes
- **Real-time webhook:** Geofence events trigger immediately (not waiting for 3-hour sync)
- **Polling delay:** Dashboard checks for updates every 2 minutes, adding 0-120 seconds latency
- **Future improvement:** SSE implementation will reduce latency to <1 second (see Diagram 5)

---

## 3. Telegram Bot State Machine (Driver Bot Phase 2)

### Purpose
Shows the conversation flow and state transitions for the driver Telegram bot.

### Diagram

```mermaid
stateDiagram-v2
    [*] --> Start: Driver sends /start
    Start --> Authenticate: Extract Telegram ID

    Authenticate --> CheckRole: Lookup in user_mapping
    CheckRole --> MainMenu: rol = "conductor"
    CheckRole --> Unauthorized: rol ≠ "conductor"
    Unauthorized --> [*]: Send "No autorizado"

    state MainMenu {
        [*] --> ShowMenu: Display 5 buttons
        ShowMenu --> PauseMenu: Click "📋 Registrar Pausa"
        ShowMenu --> IncidentMenu: Click "📝 Reportar Incidente"
        ShowMenu --> Emergency: Click "🆘 Emergencia"
        ShowMenu --> Help: Click "ℹ️ Ayuda"
        ShowMenu --> ResumeCheck: Click "▶️ Reanudar Pausa"
    }

    state PauseMenu {
        [*] --> ShowPauseTypes: Display 4 pause types
        ShowPauseTypes --> ProcessPause: Select type<br/>(baño, combustible,<br/>comida, descanso)
    }

    state ProcessPause {
        [*] --> CalculateDuration: Estimate duration<br/>by type
        CalculateDuration --> SavePause: Write to<br/>pausas_activas
        SavePause --> LogReport: Log to<br/>reportes_conductores
        LogReport --> Confirm: Send confirmation<br/>message
    }

    state IncidentMenu {
        [*] --> ShowIncidentTypes: Display 6 types
        ShowIncidentTypes --> ProcessIncident: Select type<br/>(tráfico, obra,<br/>manifestación, etc.)
    }

    state ProcessIncident {
        [*] --> SaveIncident: Write to<br/>incidentes sheet
        SaveIncident --> NotifyDispatchers: HTTP webhook<br/>to Phase 3
        NotifyDispatchers --> LogIncident: Log to<br/>reportes_conductores
        LogIncident --> ConfirmIncident: Send confirmation
    }

    state Emergency {
        [*] --> GenerateID: Create emergency ID<br/>EMERG-YYYYMMDD-XXX
        GenerateID --> SaveEmergency: Write to<br/>emergencias sheet
        SaveEmergency --> UrgentNotify: Urgent webhook<br/>urgente=true
        UrgentNotify --> ConfirmEmergency: Send SOS confirmation
    }

    state ResumeCheck {
        [*] --> FindActivePause: Query pausas_activas<br/>WHERE activa=TRUE
        FindActivePause --> MarkInactive: Set activa=FALSE<br/>hora_fin_real=NOW()
        MarkInactive --> ConfirmResume: Send confirmation
        FindActivePause --> NoPauseActive: No active pause found
        NoPauseActive --> ShowMenu: Return to menu
    }

    ProcessPause --> MainMenu: ✅ Pause registered
    ProcessIncident --> MainMenu: ✅ Incident reported
    Emergency --> MainMenu: ✅ Emergency activated
    Help --> MainMenu: Display help text
    ResumeCheck --> MainMenu: ✅ Pause resumed

    note right of CheckRole
        Authentication via
        user_mapping sheet:
        - telegram_id
        - rol (conductor/despachador)
        - unidad (T-001 to T-018)
    end note

    note right of ProcessPause
        Parallel writes to:
        1. pausas_activas (active pause tracking)
        2. reportes_conductores (audit log)

        Duration estimates:
        - Baño: 10 min
        - Combustible: 20 min
        - Comida: 30 min
        - Descanso: 4 hours
    end note

    note right of NotifyDispatchers
        Webhook to Phase 3
        (continueOnFail=true)

        Phase 3 not yet implemented,
        so notification fails gracefully
        but incident is still saved
    end note
```

### Button Callback Patterns

**Main Menu:**
- `pausas` → Show Pause Menu
- `incidentes` → Show Incident Menu
- `emergencia` → Process Emergency
- `ayuda` → Show Help
- `reanudar` → Resume Active Pause

**Pause Types:**
- `pausa_bano` → Bathroom break (10 min)
- `pausa_combustible` → Fuel stop (20 min)
- `pausa_comida` → Meal break (30 min)
- `pausa_descanso` → Rest period (4 hours)

**Incident Types:**
- `incidente_trafico` → Heavy traffic
- `incidente_obra` → Road construction
- `incidente_manifestacion` → Protest/blockage
- `incidente_clima` → Bad weather
- `incidente_mecanica` → Mechanical issue
- `incidente_otro` → Other

### Current Status (Phase 2: 95%)
✅ **Working:**
- User authentication
- Main menu with buttons
- Pause registration flow
- Data persistence to sheets

⚠️ **Needs Fix:**
- Confirmation message chat reference (5 min fix)
- Incident menu buttons missing (10 min)

❌ **Not Tested:**
- Complete incident flow
- Emergency SOS
- Pause resume functionality

---

## 4. Technology Stack

### Purpose
Shows the relationships between technologies, frameworks, and services used in the system.

### Diagram

```mermaid
graph LR
    subgraph Frontend["Frontend Layer"]
        R[React 18.2<br/>UI Framework]
        V[Vite 4.3<br/>Build Tool]
        TW[Tailwind CSS<br/>Styling via CDN]
        LU[Lucide React<br/>Icon Library]
        FM[Framer Motion<br/>Animations]
        XL[XLSX<br/>Excel Export]
    end

    subgraph Backend["Backend/Automation Layer"]
        N8[n8n Cloud<br/>Free Tier<br/>5K exec/month]
        PY[Python 3.10+<br/>Data Scripts]
    end

    subgraph APIs["External APIs"]
        WA[Wialon GPS API<br/>hst-api.wialon.com<br/>Token Auth]
        GSA[Google Sheets API<br/>Public JSON<br/>No auth required]
        TA[Telegram Bot API<br/>2 Bots Configured]
    end

    subgraph Infrastructure["Infrastructure & Hosting"]
        RD[Render<br/>Frontend Hosting<br/>Free Tier]
        GC[Google Cloud<br/>Service Account<br/>OAuth2 for n8n]
        N8C[n8n Cloud<br/>Workflow Hosting<br/>Free Tier]
    end

    subgraph Data["Data Storage"]
        SH[(Google Sheets<br/>10 Sheets<br/>~1000 rows)]
    end

    R --> V
    R --> TW
    R --> LU
    R --> FM
    R --> XL
    V --> RD

    N8 --> WA
    N8 --> GSA
    N8 --> TA
    N8 --> SH
    PY --> GSA
    PY --> SH

    R --> GSA
    GSA --> SH

    GC -.OAuth2.-> N8
    GC -.Auth.-> SH

    N8 -.hosted on.-> N8C

    style Frontend fill:#E3F2FD,stroke:#1976D2
    style Backend fill:#F3E5F5,stroke:#7B1FA2
    style APIs fill:#FFF3E0,stroke:#F57C00
    style Infrastructure fill:#E0F2F1,stroke:#00796B
    style Data fill:#FFF9C4,stroke:#F57F17
```

### Technology Details

#### Frontend Stack
| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| React | 18.2.0 | UI framework | Industry standard, component-based |
| Vite | 4.3.9 | Build tool | 10x faster than Create React App |
| Tailwind CSS | 3.x (CDN) | Styling | Utility-first, no build config |
| Lucide React | Latest | Icons | 263 icons, tree-shakeable |
| Framer Motion | 12.23.24 | Animations | Smooth KPI card animations |
| XLSX | 0.18.5 | Excel export | Dashboard data export |
| date-fns | 4.1.0 | Date handling | Internationalized for Spanish |

#### Backend/Automation
| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| n8n Cloud | Workflow automation | No-code, visual editor, free tier |
| Python 3.10+ | Data processing | KML import, geocerca migration |

#### External APIs
| API | Purpose | Authentication |
|-----|---------|----------------|
| Wialon GPS | Fleet telemetry | Token-based |
| Google Sheets | Data storage | Public read (dashboard), OAuth2 (n8n) |
| Telegram Bot | Driver/dispatcher comms | Bot tokens |

#### Infrastructure
| Service | Purpose | Tier/Cost |
|---------|---------|-----------|
| Render | Frontend hosting | Free |
| Google Cloud | Service account | Free |
| n8n Cloud | Workflow hosting | Free (5K exec/month) |

### Cost Breakdown (Current)
- **n8n Cloud:** $0/month (using 4,500 of 5,000 executions)
- **Render:** $0/month (static site)
- **Google Sheets:** $0/month (within API limits)
- **Wialon API:** [Client's existing subscription]
- **Telegram Bot:** $0/month (unlimited)

**Total Monthly Cost:** $0

### Scaling Costs (Future)
- **n8n Pro (20K exec/month):** $25/month
- **Render Pro (better uptime):** $7/month
- **PostgreSQL Database:** $5-10/month
- **Estimated for 50 units:** ~$40-50/month

---

## 5. Future Architecture (with SSE Push Notifications)

### Purpose
Shows the planned architecture with Server-Sent Events (SSE) for real-time push notifications, eliminating polling delay.

### Diagram

```mermaid
graph TB
    subgraph External["External Systems"]
        W[Wialon GPS API]
    end

    subgraph Automation["n8n Cloud"]
        N1[Telemetry Sync<br/>Every 3h]
        N2[Event Listener<br/>Real-time Webhook]
    end

    subgraph NewLayer["NEW: Express.js Server<br/>Deployed on Render"]
        EX[SSE Endpoint<br/>/api/events<br/>Streams updates to clients]
        WH[Webhook Receiver<br/>/api/webhook/update<br/>Receives from n8n]
        MEM[(In-Memory Cache<br/>Current fleet state)]
    end

    subgraph Frontend["React Dashboard Clients"]
        D1[Client 1<br/>Dispatcher A]
        D2[Client 2<br/>Dispatcher B]
        D3[Client N<br/>Management]
    end

    subgraph Legacy["Legacy: Google Sheets"]
        GS[(Google Sheets<br/>Still used for data persistence)]
    end

    W -->|Every 3h| N1
    W -->|Real-time| N2
    N1 -->|Update sheets| GS
    N2 -->|Update sheets| GS

    N1 -.->|HTTP POST<br/>New data payload| WH
    N2 -.->|HTTP POST<br/>Event payload| WH

    WH --> MEM
    MEM --> EX

    EX -.->|SSE Stream<br/>text/event-stream| D1
    EX -.->|SSE Stream<br/>text/event-stream| D2
    EX -.->|SSE Stream<br/>text/event-stream| D3

    GS -.->|Fallback only<br/>If SSE fails| D1
    GS -.->|Fallback only<br/>If SSE fails| D2
    GS -.->|Fallback only<br/>If SSE fails| D3

    style NewLayer fill:#C8E6C9,stroke:#388E3C,stroke-width:3px
    style EX fill:#66BB6A,color:#fff
    style WH fill:#66BB6A,color:#fff
    style MEM fill:#81C784,color:#fff
    style GS fill:#FFF9C4,stroke:#F57F17,stroke-dasharray: 5 5
```

### Key Changes

#### Current Architecture (Polling)
```
Dashboard → Poll every 2 minutes → Google Sheets → Return data
```
- **Requests/hour:** 30 per user
- **Network usage:** High (98% return unchanged data)
- **Latency:** 0-120 seconds (average 60 seconds)
- **Scalability:** Poor (more users = more polling)

#### Future Architecture (SSE)
```
Dashboard → Open SSE connection → Express server → Push updates immediately
```
- **Requests:** 1 initial connection, then stream
- **Network usage:** 98% reduction (only push when changed)
- **Latency:** <1 second
- **Scalability:** Excellent (handles 100+ concurrent connections)

### Implementation Status

**Status:** 📋 Fully Planned, Not Started

**Documentation:** Complete implementation plan in [`docs/technical/PUSH_NOTIFICATIONS_PLAN.md`](PUSH_NOTIFICATIONS_PLAN.md) (1,035 lines)

**Estimated Effort:** 4-6 hours
- Express.js server setup: 1-2 hours
- React SSE client: 1 hour
- n8n webhook updates: 1-2 hours
- Testing & deployment: 1 hour

**Deployment:** Render supports Node.js, can host Express server on same platform as frontend

**Benefits:**
- ✅ Instant updates (<1 second vs 0-120 seconds)
- ✅ 98% reduction in network requests
- ✅ Better scalability (100+ users)
- ✅ Lower battery usage on mobile
- ✅ Graceful degradation (falls back to polling if SSE fails)

**Next Steps:**
1. Complete Phase 2 Telegram bot testing
2. Implement SSE server (4-6 hours)
3. Deploy and test
4. Monitor performance improvements

---

## Related Documentation

### Technical Documentation
- **[Push Notifications Implementation Plan](PUSH_NOTIFICATIONS_PLAN.md)** - Complete SSE implementation guide
- **[Complete Project Documentation](../project/ELAM_Project_Documentation.md)** - Full project overview
- **[Development History](../project/DEVELOPMENT_HISTORY.md)** - Development timeline

### Setup & Deployment
- **[Setup Guide](../setup/SETUP_GUIDE.md)** - Installation instructions
- **[Deployment Guide](../setup/DEPLOYMENT_GUIDE.md)** - Production deployment

### Client Documentation
- **[Spanish Client Brief](../RESUMEN_CLIENTE.md)** - Executive summary in Spanish

---

## Diagram Update Log

| Date | Diagram | Change | Author |
|------|---------|--------|--------|
| 2025-12-09 | All | Initial creation with 5 diagrams | Claude Code |

---

**Document Version:** 1.0
**Last Updated:** December 9, 2025
**Maintained By:** ELAM Development Team
**Render Test:** View this file on GitHub to see Mermaid diagrams rendered
