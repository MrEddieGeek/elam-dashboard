# ROUTE TRACKING TEST PLAN - ELAM Telegram Listener v3

## Overview

This document provides comprehensive testing procedures and configuration guide for the ELAM route tracking workflow. The workflow includes event processing, automatic route start/completion detection, duplicate prevention, and weekly route counters.

**Status:** ✅ All features tested and working (November 25, 2025)

---

## Webhook Configuration

**Workflow:** ELAM - Telegram Listener v3 WITH ROUTE TRACKING

**Webhook URL:**
```
https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon
```

**Method:** POST
**Content-Type:** application/json

---

## Webhook Payload Format

### Required Payload Structure

```json
{
  "unidad": "T-000",
  "evento": "entrada_a_geocerca",
  "geocerca": "origem",
  "velocidad": "10 km/h",
  "lat": "19.4326",
  "lng": "-99.1332"
}
```

### Field Descriptions

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `unidad` | Yes | Vehicle identifier | "T-000" |
| `evento` | Yes | Event type (entrada/salida/alert) | "entrada_a_geocerca" |
| `geocerca` | Optional | Geofence name | "origem" |
| `hora` | Optional | Timestamp (defaults to current) | "2025-11-25 14:30:00" |
| `velocidad` | Optional | Speed (defaults to "0 km/h") | "10 km/h" |
| `lat` | Optional | Latitude | "19.4326" |
| `lng` | Optional | Longitude | "-99.1332" |
| `ubicacion` | Optional | Location (defaults to geocerca) | "origem" |

---

## Google Sheets Structure

### Required Sheets & Columns

**1. geocercas**
- `nombre` - Geofence name
- `tipo` - Type (puerto, almacen, etc)
- `status_entrada` - Status when entering
- `actividad_entrada` - Activity when entering
- `status_salida` - Status when exiting
- `actividad_salida` - Activity when exiting

**2. unidades_operadores**
- `unidad` - Unit identifier
- `operador_asignado` - Assigned operator name

**3. status_operativo**
- `Unidad` - Unit identifier
- `Status` - Current status
- `Actividad` - Current activity
- `Ubicación` - Current location
- `Próximo Movimiento` - Next movement
- `Operador` - Current operator
- `Última Actualización` - Last update timestamp
- `rutas_semana` - Weekly route counter (numeric)

**4. eventos_log**
- `timestamp` - Event timestamp
- `unidad` - Unit identifier
- `evento_tipo` - Event type (entrada/salida/alerta)
- `geocerca` - Geofence name
- `status_anterior` - Previous status
- `status_nuevo` - New status
- `lat` - Latitude
- `lng` - Longitude
- `velocidad` - Speed
- `operador` - Operator name
- `procesado_por` - Processing source
- `notas` - Additional notes

**5. rutas_programadas**
- `ruta_id` - Route identifier (e.g., "R-0001")
- `unidad` - Unit identifier (optional - can be empty)
- `origen` - Origin geofence name
- `destino` - Destination geofence name
- `geocercas_ruta` - Waypoint geofences (optional)

**6. rutas_activas**
- `unidad` - Unit identifier
- `ruta_id` - Route identifier
- `origen` - Origin geofence
- `destino` - Destination geofence
- `operador` - Operator name
- `fecha_inicio` - Start date (dd/mm/yyyy)
- `timestamp_inicio` - Start timestamp
- `geocercas_ruta` - Waypoint geofences

**7. rutas_completadas_log**
- `timestamp` - Completion timestamp
- `unidad` - Unit identifier
- `ruta_id` - Route identifier
- `origen` - Origin geofence
- `destino` - Destination geofence
- `operador` - Operator name
- `duracion_horas` - Duration in hours (numeric)
- `semana_iso` - ISO week number
- `mes` - Month (numeric)
- `año` - Year (numeric)
- `notas` - Completion notes

---

## Workflow Configuration

### Critical Node Settings

**⚠️ IMPORTANT: These nodes must use "Map Automatically" mode**

1. **Create Active Route** (Google Sheets node)
   - Operation: Append Row
   - Sheet: `rutas_activas`
   - Mapping Column Mode: **Map Automatically** ✅
   - If set to "Map Each Column Manually", it will fail

2. **Log Completed Route** (Google Sheets node)
   - Operation: Append Row
   - Sheet: `rutas_completadas_log`
   - Mapping Column Mode: **Map Automatically** ✅
   - If set to "Map Each Column Manually", it will fail

### Node Connections

The "No Active Route?" IF node must receive data from TWO sources:
- **Input:** Process Route Start (provides route data)
- **Condition:** Checks $('Check For Duplicate').first().json.ruta_id

This ensures the route data flows through while checking for duplicates.

---

## Test Data Setup

### Example Configuration

**In `geocercas` sheet:**
| nombre | tipo | status_entrada | actividad_entrada | status_salida | actividad_salida |
|--------|------|----------------|-------------------|---------------|------------------|
| origem | deposito | En Deposito | Cargando | En Ruta | Salida |
| destino | cliente | En Cliente | Descargando | Disponible | Completado |

**In `unidades_operadores` sheet:**
| unidad | operador_asignado |
|--------|-------------------|
| T-000 | CONDUCTOR DE PRUEBA |

**In `status_operativo` sheet:**
| Unidad | Status | Actividad | rutas_semana |
|--------|--------|-----------|--------------|
| T-000 | Disponible | En Base | 0 |

**In `rutas_programadas` sheet:**
| ruta_id | unidad | origen | destino |
|---------|--------|--------|---------|
| R-0001 | | origem | destino |

> Note: The `unidad` field in `rutas_programadas` can be empty. The workflow uses the actual unit from the webhook event.

---

## Testing Procedures

### TEST 1: Basic Entrada Event ✅

**Purpose:** Verify basic event processing

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "CDMX_Puerto",
    "velocidad": "15 km/h"
  }'
```

**Expected Results:**
- ✅ Response: `{"message":"Workflow was started"}`
- ✅ `status_operativo`: Row for T-000 updated
- ✅ `eventos_log`: New row with evento_tipo = "entrada"

---

### TEST 2: Route Start Detection ✅

**Purpose:** Verify route creation when entering origem

**Prerequisites:**
- Route exists in `rutas_programadas` with origen = "origem"
- T-000 has NO active route in `rutas_activas`

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "origem",
    "velocidad": "10 km/h"
  }'
```

**Expected Results:**
- ✅ `status_operativo`: Updated with origem status
- ✅ `eventos_log`: New entrada event
- ✅ `rutas_activas`: **NEW ROW** created with:
  - unidad: "T-000"
  - ruta_id: "R-0001"
  - origen: "origem"
  - destino: "destino"
  - operador: "CONDUCTOR DE PRUEBA"
  - fecha_inicio: "25/11/2025" (dd/mm/yyyy format)
  - timestamp_inicio: current timestamp

---

### TEST 3: Duplicate Prevention ✅

**Purpose:** Verify duplicate routes are not created

**Prerequisites:**
- Complete TEST 2 first (T-000 has active route)

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "origem",
    "velocidad": "10 km/h"
  }'
```

**Expected Results:**
- ✅ `status_operativo`: Updated normally
- ✅ `eventos_log`: New event logged
- ✅ `rutas_activas`: **Still only ONE row** for T-000 (no duplicate)

---

### TEST 4: Route Completion ✅

**Purpose:** Verify route completion and counter increment

**Prerequisites:**
- Complete TEST 2 (T-000 has active route)

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "destino",
    "velocidad": "20 km/h"
  }'
```

**Expected Results:**
- ✅ `status_operativo`:
  - Status updated with destino status
  - **rutas_semana: 1** (incremented from 0)
- ✅ `eventos_log`: New entrada event
- ✅ `rutas_completadas_log`: **NEW ROW** with:
  - timestamp: current
  - unidad: "T-000"
  - ruta_id: "R-0001"
  - origen: "origem"
  - destino: "destino"
  - operador: "CONDUCTOR DE PRUEBA"
  - duracion_horas: calculated (e.g., 0.07 for ~4 minutes)
  - semana_iso: ISO week number (e.g., 48)
  - mes: 11
  - año: 2025
  - notas: "Ruta completada exitosamente"
- ✅ `rutas_activas`: **Row DELETED** (T-000 no longer has active route)

---

## Additional Test Scenarios

### TEST 5: Salida Event

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "salida_de_geocerca",
    "geocerca": "origem",
    "velocidad": "25 km/h"
  }'
```

**Expected Results:**
- ✅ `status_operativo`: Updated with salida status
- ✅ `eventos_log`: New row with evento_tipo = "salida"
- ⚠️ Route tracking NOT triggered (salida events don't affect routes)

---

### TEST 6: Alert Event

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "exceso_de_velocidad",
    "velocidad": "120 km/h"
  }'
```

**Expected Results:**
- ✅ `status_operativo`: Status = "Alerta"
- ✅ `eventos_log`: evento_tipo = "alerta"
- ⚠️ Route tracking NOT triggered

---

### TEST 7: Unknown Geofence

**Command:**
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "Unknown_Location"
  }'
```

**Expected Results:**
- ✅ `status_operativo`: Uses defaults (Status = "En Ruta", Actividad = "Verificar ubicación")
- ✅ `eventos_log`: Event logged normally
- ⚠️ Workflow continues gracefully (no error)

---

### TEST 8: Sequential Routes

**Purpose:** Test completing one route and starting another

**Commands:**
1. Start new route:
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "origem",
    "velocidad": "10 km/h"
  }'
```

2. Complete second route:
```bash
curl -X POST https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon \
  -H "Content-Type: application/json" \
  -d '{
    "unidad": "T-000",
    "evento": "entrada_a_geocerca",
    "geocerca": "destino",
    "velocidad": "18 km/h"
  }'
```

**Expected Results:**
- ✅ First request: New active route created
- ✅ Second request: Route completed
- ✅ `rutas_completadas_log`: 2 total rows
- ✅ `status_operativo.rutas_semana`: **2** (incremented twice)

---

## Troubleshooting Guide

### Route Not Starting

**Symptom:** Entrada to origem doesn't create active route

**Solutions:**
1. ✅ Verify route exists in `rutas_programadas` with origin = "origem" (exact spelling)
2. ✅ Verify T-000 has NO existing active route in `rutas_activas`
3. ✅ Verify evento = "entrada_a_geocerca" (not salida)
4. ✅ Check "Create Active Route" node uses **"Map Automatically"**
5. ✅ Check "No Active Route?" IF node receives input from "Process Route Start"

### Route Not Completing

**Symptom:** Entrada to destino doesn't complete route

**Solutions:**
1. ✅ Verify T-000 HAS active route in `rutas_activas`
2. ✅ Verify geocerca name matches EXACTLY the `destino` field in active route
3. ✅ Verify evento = "entrada_a_geocerca"
4. ✅ Check "Log Completed Route" node uses **"Map Automatically"**

### Duplicate Routes Created

**Symptom:** Multiple active routes for same unit

**Solutions:**
1. ✅ Verify "Check For Duplicate" node is configured correctly
2. ✅ Verify "No Active Route?" IF node condition checks: `{{ $('Check For Duplicate').first().json.ruta_id || '' }}` equals ""
3. ✅ Ensure requests aren't sent simultaneously

### Counter Not Incrementing

**Symptom:** rutas_semana stays at 0

**Solutions:**
1. ✅ Verify route completed successfully (row added to `rutas_completadas_log`)
2. ✅ Verify "Read Current Counter" node executes before "Increment Weekly Counter"
3. ✅ Verify column name is exactly "rutas_semana" in `status_operativo`
4. ✅ Verify value is numeric (not text)

### Workflow Execution Errors

**Common Errors:**

**Error:** "Could not get parameter" on Google Sheets nodes
- **Solution:** Change Mapping Column Mode to **"Map Automatically"**

**Error:** Node shows "undefined" for all fields
- **Solution:** Check node connections - ensure data flows from correct source node

**Error:** Geocerca not found even though it exists
- **Solution:** Check spelling - names are case-sensitive

---

## Workflow Logic Summary

```
Webhook → Parser Wialon → Lookup Geocerca → Lookup Operator → Read Status
   ↓
Update Status → Log Event
   ↓
IF evento = "entrada" → Should Process Routes?
   ↓                           ↓
   NO (skip)              YES → Check Route Start & Check Active Route
                               ↓                    ↓
                         Route Start?        Active Route Exists?
                               ↓                    ↓
                    Check For Duplicate    Route at Destino?
                               ↓                    ↓
                         No Active?          Complete Route
                               ↓                    ↓
                        Create Route        Read Counter → Increment
                                                   ↓
                                            Clear Active Route
```

### Key Decision Points

1. **Should Process Routes?** - Only processes if evento includes "entrada"
2. **Check Route Start** - Looks up route in `rutas_programadas` where origen matches geocerca
3. **Check For Duplicate** - Looks up unit in `rutas_activas` to prevent duplicates
4. **No Active Route?** - Only creates route if duplicate check returns empty
5. **Check Active Route** - Looks up unit in `rutas_activas` for completion check
6. **Process Route Completion** - Only completes if geocerca matches active route's destino

---

## Important Notes

### Route Tracking Behavior

✅ **Route tracking ONLY triggers on "entrada" events**
- Salida events are logged but don't affect routes
- Alert events are logged but don't affect routes

✅ **Geofence names are case-sensitive**
- "origem" ≠ "Origem" ≠ "origen"
- Ensure consistent spelling across all sheets

✅ **Weekly counter is cumulative**
- Increments only on route completion
- Must be manually reset (use separate reset workflow)

✅ **Error handling is graceful**
- Missing geofences: workflow continues with defaults
- Missing operator: uses "Sin asignar"
- Missing status: uses "En Ruta"

✅ **Duplicate prevention works per unit**
- Only prevents duplicates for same unit
- Different units can have same route_id active simultaneously

---

## Testing Checklist

After each test, verify:

**Always Check:**
- [ ] Workflow execution shows success (no red error icon)
- [ ] `status_operativo` sheet updated for test unit
- [ ] New row in `eventos_log` with correct evento_tipo
- [ ] `Última Actualización` timestamp is recent

**For Route Start Tests:**
- [ ] New row in `rutas_activas` with correct ruta_id
- [ ] fecha_inicio in dd/mm/yyyy format
- [ ] timestamp_inicio captured correctly
- [ ] All fields populated (no empty values)

**For Route Completion Tests:**
- [ ] New row in `rutas_completadas_log`
- [ ] duracion_horas calculated correctly
- [ ] semana_iso is correct ISO week number
- [ ] rutas_semana counter incremented
- [ ] Row removed from `rutas_activas`

---

## Success Criteria

**✅ All tests pass when:**
- All entrada/salida events logged correctly
- Routes start automatically at origem
- Duplicates prevented successfully
- Routes complete automatically at destino
- Weekly counter increments correctly
- Error handling works gracefully
- No workflow execution failures

---

## Maintenance

### Weekly Tasks
- [ ] Reset `rutas_semana` counter in `status_operativo` sheet
- [ ] Review `rutas_completadas_log` for completed routes
- [ ] Check for any stale routes in `rutas_activas`

### Monthly Tasks
- [ ] Archive old data from `eventos_log`
- [ ] Review and update `rutas_programadas` as needed
- [ ] Verify `geocercas` configurations are current

---

**Document Version:** 2.0
**Last Updated:** November 25, 2025
**Status:** All tests passed ✅
**Tested By:** Claude & User
