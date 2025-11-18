# Route Tracking Setup Guide

## Overview
This guide explains how to set up the route completion tracking feature for the ELAM Dashboard.

## Google Sheets Structure

### 1. status_operativo Sheet Enhancement
Add a new column to the existing `status_operativo` sheet:

**New Column:**
- `rutas_semana` (Number) - Tracks the count of routes completed by each unit in the current calendar week (Monday-Sunday)

**Updated Column Order:**
```
Unidad | Actividad | Ubicación | Próximo Movimiento | Operador | Status | Última Actualización | rutas_semana
```

**Default Value:** 0

**Update Logic:**
- Increments by 1 each time a unit completes a route (reaches destination geofence)
- Resets to 0 every Monday at 00:00 (Mexico timezone)

---

### 2. rutas_activas Sheet (New)
This sheet tracks routes currently in progress.

**Purpose:** Temporary state storage for active routes

**Columns:**
- `unidad` (Text) - Unit ID (e.g., T-005)
- `ruta_id` (Text) - Route ID from rutas_programadas (e.g., R-0001)
- `origen` (Text) - Origin geofence name
- `destino` (Text) - Destination geofence name
- `operador` (Text) - Driver name
- `fecha_inicio` (Date) - Start date (DD/MM/YYYY format)
- `timestamp_inicio` (DateTime) - Start timestamp (YYYY-MM-DD HH:mm:ss)
- `geocercas_ruta` (Text) - Comma-separated waypoint list (informational only)

**Lifecycle:**
- **Created:** When unit enters origin geofence of a programmed route
- **Deleted:** When unit reaches destination geofence (route completed) or after 48 hours (route abandoned)

**Template:** `/templates/template_rutas_activas.csv`

---

### 3. rutas_completadas_log Sheet (New)
This sheet logs all completed routes for historical tracking and analytics.

**Purpose:** Permanent audit trail of completed routes

**Columns:**
- `timestamp` (DateTime) - Completion timestamp (YYYY-MM-DD HH:mm:ss)
- `unidad` (Text) - Unit ID
- `ruta_id` (Text) - Route ID from rutas_programadas
- `origen` (Text) - Origin geofence name
- `destino` (Text) - Destination geofence name
- `operador` (Text) - Driver name
- `duracion_horas` (Number) - Duration in hours (decimal)
- `semana_iso` (Number) - ISO week number (1-53)
- `mes` (Number) - Month (1-12)
- `año` (Number) - Year (YYYY)
- `notas` (Text) - Optional notes or alerts

**Retention:** Keep indefinitely for analytics and reporting

**Template:** `/templates/template_rutas_completadas_log.csv`

---

## Route Detection Logic

### Auto-Detection Flow

**Step 1: Route Start Detection**
```
When unit enters ANY geofence:
1. Check eventos_log for entrada event
2. Query rutas_programadas: Does this geofence match an "origen" for this unit today?
3. If YES:
   - Create record in rutas_activas
   - Store ruta_id, destino, timestamp_inicio, operador
4. If NO: Continue normal processing
```

**Step 2: Route Completion Detection**
```
When unit enters ANY geofence:
1. Check eventos_log for entrada event
2. Query rutas_activas: Is this unit currently on a route?
3. If YES: Does this geofence match the "destino"?
4. If YES (route complete):
   - Calculate duracion_horas = (current_time - timestamp_inicio) / 3600
   - Get semana_iso = ISO week number of current date
   - Log to rutas_completadas_log
   - Increment rutas_semana in status_operativo
   - Delete record from rutas_activas
5. If NO: Continue tracking
```

**Validation Rules:**
- Only START + END geofences are required
- Intermediate waypoints are informational only
- Route must be completed within 48 hours or marked abandoned
- Unit can only have one active route at a time

---

## n8n Workflow Integration

### Enhanced Telegram Listener Workflow

**New Nodes to Add:**

1. **Check Route Start** (Google Sheets node)
   - Action: Lookup values
   - Sheet: rutas_programadas
   - Lookup column: origen
   - Lookup value: `{{ $json.geocerca }}`
   - Additional condition: `unidad = {{ $json.unidad }}`

2. **Create Active Route** (Google Sheets node)
   - Action: Append row
   - Sheet: rutas_activas
   - Trigger: If route start detected
   - Values: unidad, ruta_id, origen, destino, operador, timestamp

3. **Check Route Completion** (Google Sheets node)
   - Action: Lookup values
   - Sheet: rutas_activas
   - Lookup column: unidad
   - Lookup value: `{{ $json.unidad }}`
   - Check if: `destino = {{ $json.geocerca }}`

4. **Log Completed Route** (Google Sheets node)
   - Action: Append row
   - Sheet: rutas_completadas_log
   - Trigger: If route completion detected
   - Calculate: duracion_horas, semana_iso, mes, año

5. **Increment Counter** (Google Sheets node)
   - Action: Update row
   - Sheet: status_operativo
   - Lookup column: Unidad
   - Update column: rutas_semana
   - Formula: `=rutas_semana + 1`

6. **Clear Active Route** (Google Sheets node)
   - Action: Delete row
   - Sheet: rutas_activas
   - Lookup column: unidad

---

### New Weekly Reset Workflow

**Workflow Name:** `ELAM - Weekly Counter Reset`

**Trigger:** Schedule
- Type: Cron
- Expression: `0 0 * * 1` (Every Monday at 00:00)
- Timezone: America/Mexico_City

**Nodes:**

1. **Get All Units** (Google Sheets node)
   - Action: Get many rows
   - Sheet: status_operativo
   - Range: A:H
   - Return all rows

2. **Reset Counters** (Google Sheets node)
   - Action: Update range
   - Sheet: status_operativo
   - Column: rutas_semana
   - Value: 0
   - Apply to: All rows

3. **Log Reset** (Google Sheets node)
   - Action: Append row
   - Sheet: eventos_log
   - Log: "Weekly route counters reset to 0"

**Error Handling:** Send notification if reset fails

---

## Dashboard Display

### UnitsGrid Component
Each unit card will display:
```
┌─────────────────────────────┐
│ T-005  [Status Badge]       │
│                             │
│ Actividad: En Ruta          │
│ Ubicación: CASETA No.5      │
│ Próximo: KELLOGS QRO        │
│ Operador: Juan Pérez        │
│ 🚛 3 rutas esta semana      │← NEW
│                             │
│ Última Act: 10:30 AM        │
└─────────────────────────────┘
```

### UnitsTable Component
New sortable column:
```
| Unidad | Status | Actividad | ... | Rutas (semana) |
|--------|--------|-----------|-----|----------------|
| T-005  | Ruta   | Tránsito  | ... | 3              |
| T-001  | Puerto | Descarga  | ... | 2              |
```

---

## Testing Checklist

### Phase 1: Data Setup
- [ ] Add `rutas_semana` column to status_operativo (set all to 0)
- [ ] Create rutas_activas sheet with template columns
- [ ] Create rutas_completadas_log sheet with template columns
- [ ] Verify your 3 routes exist in rutas_programadas with correct origen/destino

### Phase 2: Workflow Testing
- [ ] Deploy enhanced Telegram Listener workflow
- [ ] Deploy weekly reset workflow
- [ ] Test route start detection: Unit enters origen
- [ ] Test route completion: Same unit enters destino
- [ ] Verify rutas_activas created/deleted correctly
- [ ] Verify rutas_completadas_log entry created
- [ ] Verify rutas_semana incremented in status_operativo

### Phase 3: Frontend Testing
- [ ] Dashboard displays rutas_semana for each unit
- [ ] UnitsGrid shows route counter badge
- [ ] UnitsTable shows Rutas (semana) column
- [ ] Counter increments after route completion
- [ ] Counter resets on Monday at 00:00

### Phase 4: Edge Cases
- [ ] Unit enters wrong destination (should not complete)
- [ ] Unit starts new route before finishing previous (should replace)
- [ ] Route takes >48 hours (should be abandoned)
- [ ] Multiple units complete routes simultaneously
- [ ] Week rollover (Sunday→Monday)

---

## Troubleshooting

### Route not detected on start
- Check: Does geocerca name EXACTLY match origen in rutas_programadas?
- Check: Is unidad correctly assigned to route?
- Check: Is fecha_programada within valid range?

### Route not completing
- Check: Does geocerca name EXACTLY match destino in rutas_activas?
- Check: Is unit actually on an active route (check rutas_activas)?
- Check: Did workflow timeout or error?

### Counter not resetting
- Check: Is weekly reset workflow enabled?
- Check: Is cron schedule correct for your timezone?
- Check: Check n8n execution log for errors

---

## Future Enhancements

**Possible additions:**
- Route deviation alerts (unit goes to unexpected geofence)
- Average completion time per route
- Efficiency metrics (actual vs. estimated time)
- Monthly route completion reports
- Driver performance leaderboard
- Client-specific route tracking
- Real-time ETA calculations
- Route optimization suggestions

---

## Related Documentation
- `/docs/guides/workflow-setup.md` - n8n workflow configuration
- `/docs/project/ELAM_Project_Documentation.md` - Overall project structure
- `/templates/template_rutas_programadas.csv` - Route template format
