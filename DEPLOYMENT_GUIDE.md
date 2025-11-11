# 🚀 ELAM Fleet Data - Deployment & Testing Guide

**Version:** 2.0 Complete
**Date:** November 11, 2025
**Status:** Ready for Deployment

---

## 📊 What Was Fixed

### ✅ Problems Resolved

| Issue | Status | Solution |
|-------|--------|----------|
| ❌ "Operador" column empty in status_operativo | ✅ FIXED | Added lookup to unidades_operadores sheet |
| ❌ "Próximo Movimiento" column empty | ✅ FIXED | Added business logic based on current status |
| ❌ Event log missing "status_anterior" | ✅ FIXED | Read current status before updating |
| ❌ Event log missing "operador" | ✅ FIXED | Included operator from lookup |

### 🔧 Technical Changes

**Updated Workflow:** `ELAM - Telegram Listener v2 COMPLETE`

**New Nodes Added:**
1. **"Buscar Operador"** - Looks up operator from unidades_operadores sheet
2. **"Leer Status Actual"** - Reads current status before updating (for event logging)

**Modified Nodes:**
3. **"Determinar Nuevo Status"** - Now calculates próximo_movimiento
4. **"Actualizar Status Operativo"** - Now updates Operador and Próximo Movimiento fields
5. **"Registrar Evento"** - Now logs status_anterior and operador

**Workflow Flow (Updated):**
```
Webhook
  → Parser Wialon
    → Buscar Geocerca
      → Buscar Operador [NEW]
        → Leer Status Actual [NEW]
          → Determinar Nuevo Status [ENHANCED]
            → Actualizar Status Operativo [ENHANCED]
              → Registrar Evento [ENHANCED]
```

---

## 📥 Deployment Steps

### Step 1: Backup Current Workflow (Safety First!)

1. Go to n8n: https://app.n8n.cloud
2. Open workflow: "ELAM - Telegram Listener v2"
3. Click **"⋮" menu** → **"Duplicate"**
4. Rename to: `ELAM - Telegram Listener v2 BACKUP 2025-11-11`
5. This ensures you can rollback if needed

### Step 2: Import Updated Workflow

**Option A: Update Existing Workflow (Recommended)**

1. Open: `ELAM - Telegram Listener v2` workflow in n8n
2. **Deactivate** the workflow (toggle switch to OFF)
3. Click **"⋮" menu** → **"Delete"** (we'll reimport)
4. Confirm deletion
5. Click **"Add workflow"** → **"Import from File"**
6. Select: `/home/mreddie/Desktop/Recursiones/ELAM/elam-dashboard/n8n_workflows/ELAM_-_Telegram_Listener_v2_COMPLETE.json`
7. Click **"Import"**

**Option B: Side-by-Side Testing**

1. Keep old workflow active
2. Import new workflow as separate workflow
3. Test new workflow first
4. Once verified, deactivate old, activate new

### Step 3: Configure Credentials

1. Open the newly imported workflow
2. For each Google Sheets node (there are 5 nodes):
   - Click on the node
   - Under "Credential to connect with"
   - Select: **"ELAM_Google_Sheets"** (your existing credential)
3. Save the workflow

### Step 4: Verify Webhook URL

1. Click on **"Webhook"** node
2. Copy the Webhook URL (should be: `https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon`)
3. Verify this matches your Wialon notification configuration
4. If different, update either:
   - **Option A:** Update Wialon to use this URL
   - **Option B:** Edit webhook path in n8n to match Wialon

### Step 5: Activate Workflow

1. Click **"Save"** button (top right)
2. Toggle **"Active"** switch to ON
3. Workflow is now live! 🎉

---

## 🧪 Testing Plan

### Test 1: Verify Workflow Connections

**Objective:** Ensure all nodes are properly connected

**Steps:**
1. Open workflow in n8n
2. Visual inspection: All nodes should be connected in a straight line
3. Click "Execute Workflow" button (manual test)
4. Check if any nodes show errors

**Expected Result:**
- No broken connections
- All nodes light up when executed
- No red error indicators

---

### Test 2: Manual Webhook Test

**Objective:** Test the complete flow with simulated data

**Steps:**

1. Get Webhook URL from n8n:
   - Click on "Webhook" node
   - Copy the URL

2. Send test request using curl:

```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-001",
    "evento": "entrada_geocerca",
    "geocerca": "PENSION TLAQUEPAQUE",
    "hora": "2025-11-11 18:00:00",
    "velocidad": "0",
    "lat": "20.6",
    "lng": "-103.3"
  }'
```

3. Check execution in n8n:
   - Go to "Executions" tab
   - Open latest execution
   - Verify all nodes succeeded

4. Verify Google Sheets:
   - Open: https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit
   - Go to **status_operativo** tab
   - Find row for T-001
   - **VERIFY THESE FIELDS ARE FILLED:**
     - ✅ Actividad
     - ✅ Ubicación
     - ✅ **Operador** ← NEW (should show operator name)
     - ✅ **Próximo Movimiento** ← NEW (should show next expected action)
     - ✅ Status
     - ✅ Última Actualización

5. Check event log:
   - Go to **eventos_log** tab
   - Find latest entry
   - **VERIFY THESE FIELDS ARE FILLED:**
     - ✅ timestamp
     - ✅ unidad
     - ✅ evento_tipo
     - ✅ geocerca
     - ✅ **status_anterior** ← NEW
     - ✅ status_nuevo
     - ✅ lat, lng
     - ✅ velocidad
     - ✅ **operador** ← NEW
     - ✅ procesado_por
     - ✅ notas

**Expected Results:**
- ✅ All fields populated
- ✅ Operator matches the one assigned in unidades_operadores
- ✅ Próximo Movimiento matches business logic
- ✅ Event log complete with all fields

---

### Test 3: Real Wialon Event

**Objective:** Test with actual geofence event from Wialon

**Steps:**

1. Identify a test unit (e.g., T-001)

2. Manually move the unit or wait for natural geofence crossing:
   - Option A: If you have access to GPS device, drive to a geofence
   - Option B: Wait for normal operations to trigger an event

3. Wialon should send webhook automatically

4. Monitor n8n execution:
   - Go to "Executions" tab
   - Wait for new execution to appear
   - Verify it succeeded

5. Check Google Sheets (same as Test 2)

**Expected Results:**
- ✅ Real-time update within seconds
- ✅ All fields filled correctly
- ✅ Operator matches current driver
- ✅ Status reflects geofence type

---

### Test 4: Multiple Units Stress Test

**Objective:** Ensure workflow handles multiple events correctly

**Steps:**

1. Send multiple test requests in quick succession:

```bash
#!/bin/bash
for unit in T-001 T-002 T-003 T-004; do
  curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
    -H "Content-Type: application/json" \
    -d "{
      \"unidad\": \"$unit\",
      \"evento\": \"salida_geocerca\",
      \"geocerca\": \"PENSION TLAQUEPAQUE\",
      \"hora\": \"$(date '+%Y-%m-%d %H:%M:%S')\",
      \"velocidad\": \"45\",
      \"lat\": \"20.6\",
      \"lng\": \"-103.3\"
    }"
  sleep 2
done
```

2. Verify all 4 units updated in Google Sheets

3. Check all 4 events logged

**Expected Results:**
- ✅ All units processed
- ✅ No executions failed
- ✅ Data consistency across all units

---

### Test 5: Edge Cases

**Objective:** Test unusual scenarios

**Test 5.1: Unit Not in unidades_operadores**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-999",
    "evento": "entrada_geocerca",
    "geocerca": "TEST LOCATION",
    "velocidad": "30"
  }'
```
**Expected:** Operador = "Sin asignar"

**Test 5.2: Unknown Geocerca**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-001",
    "evento": "entrada_geocerca",
    "geocerca": "UNKNOWN PLACE",
    "velocidad": "40"
  }'
```
**Expected:** Status = "En Ruta", Actividad = "Verificar ubicación"

**Test 5.3: Alert Event (not entrada/salida)**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-001",
    "evento": "exceso_velocidad",
    "geocerca": "CARRETERA LIBRE",
    "velocidad": "120"
  }'
```
**Expected:** Status = "Alerta", Actividad = "exceso velocidad"

---

## 📋 Validation Checklist

After deployment, verify:

### Google Sheets: status_operativo

| Field | Should Contain | Verified |
|-------|---------------|----------|
| Unidad | Unit name (T-001 to T-018) | ☐ |
| Actividad | Current activity | ☐ |
| Ubicación | Current location/geofence | ☐ |
| **Próximo Movimiento** | **Next expected action** | ☐ |
| **Operador** | **Driver name** | ☐ |
| Status | Current status | ☐ |
| Última Actualización | Recent timestamp | ☐ |

### Google Sheets: eventos_log

| Field | Should Contain | Verified |
|-------|---------------|----------|
| timestamp | Event time | ☐ |
| unidad | Unit name | ☐ |
| evento_tipo | entrada/salida/alerta | ☐ |
| geocerca | Geofence name | ☐ |
| **status_anterior** | **Previous status** | ☐ |
| status_nuevo | New status | ☐ |
| lat | Latitude | ☐ |
| lng | Longitude | ☐ |
| velocidad | Speed (km/h) | ☐ |
| **operador** | **Driver name** | ☐ |
| procesado_por | "Automático" | ☐ |
| notas | Event details | ☐ |

---

## 🔍 Troubleshooting

### Issue: "Buscar Operador" node fails

**Symptoms:**
- Operator column still empty
- Node shows error in execution

**Possible Causes:**
1. unidades_operadores sheet doesn't have the unit
2. Column name mismatch
3. Credential not configured

**Solutions:**
1. Check unidades_operadores sheet has all 18 units (T-001 to T-018)
2. Verify column name is exactly "unidad" (lowercase)
3. Verify Google Sheets credential is connected
4. If unit not found: Workflow will set "Sin asignar" (this is expected behavior)

---

### Issue: "Leer Status Actual" node fails

**Symptoms:**
- status_anterior in event log is empty
- Node shows error

**Possible Causes:**
1. status_operativo sheet empty
2. Unit not found in sheet

**Solutions:**
1. Ensure status_operativo has all 18 units with Status column filled
2. If unit doesn't exist yet, it will show "Desconocido" (expected for first event)

---

### Issue: Próximo Movimiento shows "Verificar status"

**Cause:** Status doesn't match any known status in the logic

**Solution:**
1. Check mapeo_status sheet for valid status values
2. Update "Determinar Nuevo Status" code if new status types added
3. This is a fallback value and is safe

---

### Issue: Webhook not receiving events

**Symptoms:**
- No new executions in n8n
- Wialon events not triggering

**Solutions:**
1. Verify workflow is **Active** (toggle ON)
2. Check webhook URL in Wialon notifications matches n8n
3. Test webhook manually with curl (see Test 2)
4. Check Wialon notification configuration

---

### Issue: Some fields update but not others

**Symptoms:**
- Operador fills but Próximo Movimiento doesn't
- Or vice versa

**Solutions:**
1. Check "Actualizar Status Operativo" node mapping
2. Ensure "removed": false for both "Operador" and "Próximo Movimiento" fields
3. Verify "Determinar Nuevo Status" code returns all fields
4. Check node execution output to see what data is being passed

---

## 📊 Próximo Movimiento Logic Reference

For troubleshooting, here's the complete mapping:

| Current Status | Próximo Movimiento |
|---------------|-------------------|
| Pensión / Pensíon | Disponible para asignación |
| Taller | En reparación |
| Descargando | Regreso a base |
| En Puerto | Esperando carga |
| Disponible | Pendiente de asignación |
| En Ruta | En tránsito |
| Caseta | En tránsito |
| **Other/Unknown** | Verificar status |

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ **All 18 units** have Operador filled in status_operativo
✅ **All 18 units** have Próximo Movimiento filled
✅ **New events** populate all fields in eventos_log
✅ **status_anterior** captures previous status before update
✅ **Workflow executions** succeed with no errors
✅ **Dashboard** shows complete operational data

---

## 📞 Rollback Plan

If something goes wrong:

### Quick Rollback (5 minutes)

1. Go to n8n workflows
2. **Deactivate** the new workflow
3. **Activate** the backup: `ELAM - Telegram Listener v2 BACKUP 2025-11-11`
4. System returns to previous state
5. Review execution logs to identify issue

### Data Cleanup (if needed)

If test data polluted production:

```sql
-- Delete test events from eventos_log
-- Use Google Sheets filter/delete or:
DELETE FROM eventos_log WHERE unidad = 'T-999' OR notas LIKE '%TEST%'

-- Reset test unit status
UPDATE status_operativo
SET Status = 'Disponible',
    Actividad = '',
    Ubicación = 'Pensión',
    Operador = '',
    "Próximo Movimiento" = ''
WHERE Unidad = 'T-999'
```

**Note:** Google Sheets doesn't support SQL. Use manual filtering or Apps Script.

---

## 🚀 Next Steps After Deployment

### 1. Monitor for 24 Hours

- Check executions every few hours
- Verify real events populate correctly
- Ensure no errors accumulate

### 2. Review Dashboard

- Update dashboard (if needed) to display new fields
- Add Operador column to UI
- Add Próximo Movimiento to unit cards

### 3. Future Enhancements

Based on context.txt roadmap:

- **Phase 2:** Maintenance alerts (mantenimientos sheet)
- **Phase 3:** Cost tracking (costos_ingresos automation)
- **Phase 4:** Route planning (rutas_programadas)
- **Phase 5:** ML predictions

---

## 📁 Files Reference

| File | Purpose | Location |
|------|---------|----------|
| **ELAM_-_Telegram_Listener_v2_COMPLETE.json** | Updated event workflow | `n8n_workflows/` |
| **ELAM - Wialon to Sheets (cada 3h).json** | Telemetry workflow (unchanged) | `n8n_workflows/` |
| **ELAM - Complete Sync (Units + Geocercas).json** | Combined sync (ready for use) | `n8n_workflows/` |
| **DEPLOYMENT_GUIDE.md** | This guide | Project root |
| **GEOCERCAS_SYNC_GUIDE.md** | Geocercas import guide | Project root |

---

## ✅ Quick Start Summary

**For the impatient:**

1. Backup current workflow in n8n
2. Import: `ELAM_-_Telegram_Listener_v2_COMPLETE.json`
3. Configure Google Sheets credentials (5 nodes)
4. Activate workflow
5. Send test webhook (curl command from Test 2)
6. Check Google Sheets for filled fields
7. Done! ✨

**Total time:** 15-20 minutes

---

**Last Updated:** November 11, 2025
**Version:** 2.0
**Status:** Production Ready ✅
