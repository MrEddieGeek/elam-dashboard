# Wialon Puerto Notifications Setup Guide

**ELAM Logistics Fleet Management System**

This guide provides step-by-step instructions for configuring 16 puerto (port) geofence notifications in Wialon to enable real-time tracking of units entering and exiting port locations.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Port Geofences to Configure](#port-geofences-to-configure)
4. [Setup Method 1: Manual Configuration](#setup-method-1-manual-configuration-recommended)
5. [Setup Method 2: CSV Import](#setup-method-2-csv-import-if-supported)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## Overview

### What This Does

When a unit enters or exits any of the 8 puerto geofences, Wialon will:
1. Trigger a notification
2. Send a POST request to the n8n webhook
3. Update the operational status in Google Sheets
4. Display the new status in the ELAM Dashboard

### System Flow

```
Unit crosses puerto geofence boundary
    ↓
Wialon triggers notification
    ↓
POST request sent to n8n webhook (https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon)
    ↓
n8n workflow processes event
    ↓
Google Sheets (status_operativo) updated
    ↓
Dashboard displays new status (auto-refresh every 2 min)
```

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Wialon admin access** with permission to create notifications
- ✅ **8 puerto geofences already created in Wialon** (ASLA LZC, ADUANA LZC, etc.)
- ✅ **Geofence names match exactly** with the names in Google Sheets `geocercas` sheet
- ✅ **n8n webhook URL active**: `https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon`
- ✅ **n8n workflow "Telegram Listener v2 COMPLETE" deployed and active**

### Verify Prerequisites

1. **Check Geofences Exist in Wialon:**
   - Log into Wialon
   - Go to **Geofences** panel
   - Verify all 8 puerto geofences are visible

2. **Check Geofence Names Match:**
   - Open Google Sheets: [ELAM Status Operativo](https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit)
   - Go to `geocercas` tab
   - Find rows with `tipo = "puerto"`
   - Names must match **exactly** (case-sensitive)

---

## Port Geofences to Configure

You will create **16 notifications total** (2 per port: entry + exit):

| # | Puerto Name | Entry Notification | Exit Notification |
|---|-------------|-------------------|-------------------|
| 1 | ASLA LZC | ✅ Entrada_ASLA_LZC | ✅ Salida_ASLA_LZC |
| 2 | ADUANA LZC | ✅ Entrada_ADUANA_LZC | ✅ Salida_ADUANA_LZC |
| 3 | AUDITORIA LZC | ✅ Entrada_AUDITORIA_LZC | ✅ Salida_AUDITORIA_LZC |
| 4 | APM TERMINALS LZC | ✅ Entrada_APM_TERMINALS_LZC | ✅ Salida_APM_TERMINALS_LZC |
| 5 | HUTCHISON PORT LZC | ✅ Entrada_HUTCHISON_PORT_LZC | ✅ Salida_HUTCHISON_PORT_LZC |
| 6 | MKS LZC | ✅ Entrada_MKS_LZC | ✅ Salida_MKS_LZC |
| 7 | BLVD. AEROPUERTO MIGUEL ALEMÁN | ✅ Entrada_BLVD_AEROPUERTO_MIGUEL_ALEMAN | ✅ Salida_BLVD_AEROPUERTO_MIGUEL_ALEMAN |
| 8 | COMPLEJO PORTUARIO LZC | ✅ Entrada_COMPLEJO_PORTUARIO_LZC | ✅ Salida_COMPLEJO_PORTUARIO_LZC |

---

## Setup Method 1: Manual Configuration (Recommended)

This is the most reliable method. You'll create each notification one by one in Wialon.

### Step-by-Step Instructions

#### **For Each Entry Notification (8 total):**

1. **Access Notifications Panel**
   - Log into Wialon: [https://hst-api.wialon.com](https://hst-api.wialon.com)
   - Click on **"Notifications"** in the left sidebar
   - Click **"New"** to create a notification

2. **Configure Notification Settings**

   **General Tab:**
   - **Name**: `Entrada_[PUERTO_NAME]` (e.g., `Entrada_ASLA_LZC`)
   - **Units**: Select **"All units"** or specific units you want to track
   - **Active**: ✅ Checked

3. **Configure Control Tab**

   - **Control Type**: Select **"Inside geofence"**
   - **Geofence**: Click the selector and choose the specific puerto geofence (e.g., "ASLA LZC")
   - **Additional conditions**: Leave empty
   - **Control activity time**: 24/7 (all days, all hours)

4. **Configure Action Tab**

   Click **"Add action"** and configure:

   - **Action Type**: Select **"Send POST request"**
   - **URL**: `https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon`
   - **Method**: `POST`
   - **Content-Type**: `application/json`
   - **Body** (copy this template and replace [PUERTO_NAME] with the actual geofence name):

   ```json
   {
     "unidad": "%UNIT%",
     "evento": "entrada_puerto",
     "geocerca": "%ZONE%",
     "hora": "%POS_TIME%",
     "velocidad": "%SPEED%",
     "ubicacion": "%LOCATION%"
   }
   ```

   **Important Template Variables:**
   - `%UNIT%` - Replaced with unit ID (e.g., T-001)
   - `%ZONE%` - Replaced with geofence name
   - `%POS_TIME%` - Timestamp of the event
   - `%SPEED%` - Current speed in km/h
   - `%LOCATION%` - Address/coordinates

5. **Save Notification**
   - Click **"Save"** button
   - Notification should appear in your notifications list

#### **For Each Exit Notification (8 total):**

Repeat the above steps with these changes:

- **Name**: `Salida_[PUERTO_NAME]` (e.g., `Salida_ASLA_LZC`)
- **Control Type**: Select **"Outside geofence"** (not "Inside")
- **Body**: Change `"evento": "salida_puerto"` instead of entrada

---

## Setup Method 2: CSV Import (If Supported)

**Note**: Wialon's CSV import feature may vary by version. If unavailable, use Method 1.

### Import Steps

1. **Locate the CSV File**
   - File location: `templates/wialon_puerto_notifications.csv`
   - Contains all 16 notifications pre-configured

2. **Access Import Feature in Wialon**
   - Go to **Notifications** panel
   - Look for **"Import"** or **"Upload"** button
   - Select the CSV file

3. **Map CSV Columns**
   - Wialon may ask you to map columns
   - Ensure:
     - "Name" → Notification Name
     - "Control type" → Trigger Type
     - "Actions" → Action Configuration
     - "Text" → POST body

4. **Configure Geofence Mapping**
   - For each notification, you'll need to manually select the geofence
   - Match notification names to geofence names
   - Example: `Entrada_ASLA_LZC` → Select "ASLA LZC" geofence

5. **Configure Webhook URL**
   - If not imported, manually add to each notification:
   - URL: `https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon`

6. **Activate All Notifications**
   - Select all imported notifications
   - Enable them

---

## Webhook Configuration

### Webhook URL

All notifications send POST requests to:

```
https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon
```

### Request Format

**Headers:**
```
Content-Type: application/json
```

**Body (Entry Event):**
```json
{
  "unidad": "T-001",
  "evento": "entrada_puerto",
  "geocerca": "ASLA LZC",
  "hora": "2025-11-11 12:34:56",
  "velocidad": "45",
  "ubicacion": "Boulevard De Los Cabos, Rinconcito Feliz"
}
```

**Body (Exit Event):**
```json
{
  "unidad": "T-001",
  "evento": "salida_puerto",
  "geocerca": "ASLA LZC",
  "hora": "2025-11-11 14:22:10",
  "velocidad": "30",
  "ubicacion": "Boulevard De Los Cabos, Rinconcito Feliz"
}
```

### n8n Workflow Processing

The webhook is processed by: **"ELAM - Telegram Listener v2 COMPLETE"**

**Processing Steps:**
1. **Parser Wialon** - Extracts data from JSON
2. **Buscar Geocerca** - Looks up geofence in `geocercas` sheet
3. **Buscar Operador** - Looks up driver from `unidades_operadores` sheet
4. **Leer Status Actual** - Reads current status before updating
5. **Determinar Nuevo Status** - Maps puerto entry/exit to new status
6. **Actualizar Status Operativo** - Updates `status_operativo` sheet
7. **Registrar Evento** - Logs event to `eventos_log` sheet

---

## Testing & Verification

### Pre-Flight Checklist

Before testing, verify:

- [ ] All 16 notifications created and active in Wialon
- [ ] Geofence names match exactly (case-sensitive)
- [ ] Webhook URL correct in all notifications
- [ ] n8n workflow is active (green status in n8n Cloud)
- [ ] Google Sheets has puerto geofences in `geocercas` sheet with `tipo = "puerto"`

### Test Scenario 1: Single Unit Manual Test

**Goal**: Verify one puerto notification works end-to-end

1. **Select a Test Unit**
   - Choose a unit currently **outside** a puerto geofence
   - Example: T-001

2. **Trigger Entry Event**
   - In Wialon, use **"Tools"** → **"Track Player"**
   - Or wait for a real unit to enter a puerto

3. **Verify Notification Fires**
   - Go to **Notifications** → **Execution Log**
   - Look for `Entrada_[PUERTO_NAME]` notification
   - Status should be "Executed successfully"

4. **Check n8n Webhook Received Data**
   - Log into n8n Cloud: [https://elam-logistic.app.n8n.cloud](https://elam-logistic.app.n8n.cloud)
   - Go to **Workflows** → **"Telegram Listener v2 COMPLETE"**
   - Click **"Executions"** tab
   - Latest execution should show:
     - ✅ Success (green)
     - Input data contains `"evento": "entrada_puerto"`
     - Output shows updated status

5. **Verify Google Sheets Updated**
   - Open [ELAM Status Operativo Sheet](https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit)
   - Go to `status_operativo` tab
   - Find the test unit (e.g., T-001)
   - Check columns:
     - **Estatus**: Should reflect puerto entry (from `geocercas.status_entrada`)
     - **Actividad**: Should show puerto activity (from `geocercas.actividad_entrada`)
     - **Ubicación**: Should show puerto name
     - **Próximo Movimiento**: Should be auto-calculated
     - **Operador**: Should be populated (if assigned)
     - **Última Actualización**: Should be recent timestamp

6. **Verify Dashboard Display**
   - Open dashboard: [https://elam-dashboard.onrender.com](https://elam-dashboard.onrender.com)
   - Wait up to 2 minutes for auto-refresh (or click "Actualizar")
   - Find test unit in table
   - Verify:
     - Status badge shows correct puerto status
     - Location shows puerto name
     - All fields populated correctly

7. **Test Exit Event**
   - Wait for unit to leave the puerto OR use Track Player
   - Verify `Salida_[PUERTO_NAME]` notification fires
   - Repeat steps 4-6 to verify exit processing

### Test Scenario 2: Multiple Units

**Goal**: Verify system handles concurrent puerto events

1. Monitor 3+ units entering/exiting puertos simultaneously
2. Check n8n execution log for no errors
3. Verify all Google Sheets rows update correctly
4. Check dashboard shows all units correctly

### Test Scenario 3: Edge Cases

**Goal**: Verify error handling

1. **Unit enters unregistered geofence**
   - Expected: Workflow continues, uses default status
   - Check `eventos_log` for entry with `geocerca = "Unknown"`

2. **Webhook receives malformed data**
   - Expected: n8n Parser node handles gracefully
   - Check execution log for errors

3. **Google Sheets temporarily unavailable**
   - Expected: n8n retries or logs error
   - Check for retry attempts in execution log

---

## Troubleshooting

### Issue 1: Notification Not Firing

**Symptoms:**
- Unit enters/exits puerto but no notification in Wialon log
- n8n shows no new executions

**Diagnosis:**
1. Check notification is **Active** (enabled) in Wialon
2. Verify unit is included in notification's unit list
3. Check geofence boundaries are correct (unit actually crossed boundary)
4. Verify "Control activity time" is 24/7 (not restricted to certain hours)

**Solution:**
- Edit notification → General tab → Check "Active" box
- Edit notification → General tab → Add missing units
- Review geofence coordinates in Wialon

---

### Issue 2: Webhook Not Receiving Data

**Symptoms:**
- Notification fires in Wialon (shows in execution log)
- n8n workflow shows no executions
- Dashboard not updating

**Diagnosis:**
1. Check webhook URL is correct in Wialon notification
2. Verify n8n workflow is active (not paused)
3. Check n8n workflow webhook node is enabled

**Solution:**
- Copy webhook URL from n8n workflow → Edit Wialon notification → Update URL
- In n8n Cloud → Workflows → Activate workflow (toggle switch)
- Check webhook node settings → Ensure "Webhook Path" matches

---

### Issue 3: Wrong Status in Dashboard

**Symptoms:**
- Unit enters puerto but dashboard shows wrong status
- Status not matching expected behavior

**Diagnosis:**
1. Check `geocercas` sheet has correct status mappings:
   - `status_entrada` column = status to set on entry
   - `status_salida` column = status to set on exit
2. Verify geofence name in Wialon matches name in `geocercas` sheet (case-sensitive)
3. Check n8n workflow "Determinar Nuevo Status" node logic

**Solution:**
- Edit `geocercas` sheet → Update `status_entrada`/`status_salida` for puerto geofences
- Rename geofence in Wialon OR update name in Google Sheets to match
- Review n8n workflow logic and adjust if needed

---

### Issue 4: Duplicate Events

**Symptoms:**
- Multiple notifications firing for single boundary crossing
- Duplicate rows in `eventos_log`

**Diagnosis:**
1. Check for duplicate notifications with same name/trigger
2. Verify geofence boundaries don't overlap
3. Check if unit oscillates near boundary (GPS drift)

**Solution:**
- Delete duplicate notifications in Wialon
- Adjust geofence boundaries to eliminate overlap
- Add cooldown period in n8n workflow (advanced)

---

### Issue 5: Webhook Returns Error

**Symptoms:**
- Wialon notification log shows "HTTP 500" or "HTTP 400" error
- n8n execution shows error status (red)

**Diagnosis:**
1. Check n8n execution log for specific error message
2. Verify JSON payload format is correct
3. Check Google Sheets API is accessible

**Solution:**
- Review error in n8n execution → Fix workflow node causing error
- Validate JSON payload in Wialon notification (use JSON validator)
- Check Google Sheets sharing permissions (must be shared with service account)

---

## Maintenance

### Regular Checks (Weekly)

- [ ] Review n8n execution log for errors
- [ ] Check Wialon notification execution stats
- [ ] Verify all notifications still active
- [ ] Review `eventos_log` sheet for unusual patterns

### Monthly Tasks

- [ ] Audit geofence boundaries (ensure accuracy)
- [ ] Update `geocercas` sheet with any new puerto geofences
- [ ] Review and clean up old notification configurations
- [ ] Test random unit entries/exits to verify system health

### When Adding New Puerto Geofences

1. Create geofence in Wialon
2. Add to `geocercas` sheet in Google Sheets with:
   - `tipo = "puerto"`
   - `status_entrada` and `status_salida`
   - `actividad_entrada` and `actividad_salida`
3. Create 2 notifications (entry + exit) using templates above
4. Test with a unit
5. Document in this guide

---

## Quick Reference

### Notification Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `%UNIT%` | Unit identifier | T-001 |
| `%ZONE%` | Geofence name | ASLA LZC |
| `%POS_TIME%` | Event timestamp | 2025-11-11 14:23:45 |
| `%SPEED%` | Speed in km/h | 45 |
| `%LOCATION%` | Address/coordinates | Boulevard De Los Cabos |
| `%LAT%` | Latitude | 17.97855 |
| `%LON%` | Longitude | -102.0 |

### Event Types

| Event | Wialon Control Type | Description |
|-------|---------------------|-------------|
| `entrada_puerto` | Inside geofence | Unit enters puerto boundary |
| `salida_puerto` | Outside geofence | Unit exits puerto boundary |

### System URLs

- **Wialon**: https://hst-api.wialon.com
- **n8n Cloud**: https://elam-logistic.app.n8n.cloud
- **Google Sheets**: https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit
- **Dashboard**: https://elam-dashboard.onrender.com
- **Webhook URL**: https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon

---

## Success Criteria Checklist

When you've completed the setup, verify:

- [ ] ✅ All 16 notifications created and active in Wialon
- [ ] ✅ All notifications sending to correct webhook URL
- [ ] ✅ Test unit entry event successfully updates dashboard
- [ ] ✅ Test unit exit event successfully updates dashboard
- [ ] ✅ n8n workflow executions show 100% success rate
- [ ] ✅ Google Sheets `status_operativo` updating in real-time
- [ ] ✅ Google Sheets `eventos_log` capturing all puerto events
- [ ] ✅ Dashboard displays correct status, location, and next movement
- [ ] ✅ All 8 puerto geofences responding correctly

---

## Support & Documentation

**Project Documentation:**
- Main README: `README.md`
- Setup Guide: `SETUP_GUIDE.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`
- Geocercas Sync: `GEOCERCAS_SYNC_GUIDE.md`
- n8n Security: `N8N_SECURITY_GUIDE.md`

**Technical Details:**
- n8n Workflows: `n8n_workflows/` directory
- CSV Template: `templates/wialon_puerto_notifications.csv`
- Geofence Templates: `templates/template_geocercas_completo.csv`

**GitHub Repository:**
- https://github.com/MrEddieGeek/elam-dashboard

---

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Author:** ELAM Logistics Technical Team
**Status:** Production Ready
