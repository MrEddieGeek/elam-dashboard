# Route Tracking Logic - Any Unit, Any Route

## Overview

The ELAM route tracking system allows **ANY unit to complete ANY route**. Routes are defined by their **origin** and **destination** geofences only. Unit assignments in `rutas_programadas` are optional and used only for planning/reference purposes.

---

## How It Works

### Route Definition
Routes are defined in the `rutas_programadas` sheet with:
- `ruta_id` - Unique route ID (e.g., R-0001, R-0002, R-0003)
- `origen` - Origin geofence name (must exactly match `geocercas.nombre`)
- `destino` - Destination geofence name (must exactly match `geocercas.nombre`)
- `unidad` - OPTIONAL field (for planning only, any unit can complete the route)
- Other fields: operador, cliente, carga, etc. (informational)

**Example Routes:**
```csv
ruta_id,unidad,origen,destino,cliente
R-0001,,ELAM FAW STEP JAL,KELLOGS QUERETARO,Kellogs
R-0002,,ELAM FAW STEP JAL,MABE SAN LUIS POTOSI,Mabe
R-0003,,ELAM FAW STEP JAL,HONDA CELAYA,Honda
```

Note: `unidad` column can be empty or contain any value - it's ignored for route detection.

---

## Detection Logic

### Route Start Detection

**Trigger:** Unit enters ANY geofence

**Logic:**
```
1. Check: Does this geofence match ANY route's `origen` in rutas_programadas?

   YES → Route detected!
       → Create record in rutas_activas:
           - unidad: [Actual unit that entered] ← Uses real unit from event
           - ruta_id: [Matching route ID]
           - origen: [Geofence name]
           - destino: [From matched route]
           - timestamp_inicio: [Current timestamp]

   NO → Continue normal event processing
```

**Important:** The system does NOT check which unit is assigned to the route. If T-005 enters "ELAM FAW STEP JAL" (which is the origin of R-0001), it will start tracking R-0001 for T-005, regardless of what's in the `unidad` column of `rutas_programadas`.

### Route Completion Detection

**Trigger:** Unit enters ANY geofence

**Logic:**
```
1. Check: Does this unit have an active route in rutas_activas?

   YES → Check: Does current geofence match the route's `destino`?

       YES → Route completed!
           → Log to rutas_completadas_log
           → Increment rutas_semana counter for this unit
           → Delete record from rutas_activas

       NO → Keep tracking, wait for next event

   NO → Continue normal event processing
```

---

## Data Flow Example

### Scenario: T-010 completes route R-0001

**Step 1: Route Start**
```
Event: T-010 enters "ELAM FAW STEP JAL" at 06:00 AM

Workflow checks:
  - Is "ELAM FAW STEP JAL" an origen in rutas_programadas? → YES (R-0001)
  - Does T-010 already have an active route? → NO

Action: Create record in rutas_activas
  unidad: T-010           ← Actual unit from event
  ruta_id: R-0001
  origen: ELAM FAW STEP JAL
  destino: KELLOGS QUERETARO  ← From R-0001 definition
  timestamp_inicio: 2025-11-18 06:00:00
```

**Step 2: Intermediate Events (Optional)**
```
Event: T-010 enters "CASETA No. 5 QRO" at 08:30 AM

Workflow checks:
  - Does T-010 have an active route? → YES (R-0001)
  - Is "CASETA No. 5 QRO" the destino of R-0001? → NO (destino is "KELLOGS QUERETARO")

Action: Continue tracking (no changes to rutas_activas)
```

**Step 3: Route Completion**
```
Event: T-010 enters "KELLOGS QUERETARO" at 12:30 PM

Workflow checks:
  - Does T-010 have an active route? → YES (R-0001)
  - Is "KELLOGS QUERETARO" the destino of R-0001? → YES!

Action: Route completed!
  1. Log to rutas_completadas_log:
     timestamp: 2025-11-18 12:30:00
     unidad: T-010
     ruta_id: R-0001
     origen: ELAM FAW STEP JAL
     destino: KELLOGS QUERETARO
     duracion_horas: 6.5
     semana_iso: 47

  2. Update status_operativo:
     T-010.rutas_semana: 0 → 1

  3. Delete from rutas_activas:
     Remove T-010's active route record
```

**Dashboard Display:**
```
Unit T-010 card now shows:
  🚛 1 ruta completada esta semana
```

---

## Multiple Units, Same Route

**Question:** What if two units start the same route?

**Answer:** Each unit tracks independently.

**Example:**
```
Monday 06:00 - T-005 enters ELAM FAW STEP JAL
  → rutas_activas: T-005 | R-0001 | ELAM → KELLOGS

Monday 07:00 - T-010 enters ELAM FAW STEP JAL
  → rutas_activas: T-005 | R-0001 | ELAM → KELLOGS
                   T-010 | R-0001 | ELAM → KELLOGS  ← Same route, different unit

Monday 12:00 - T-005 arrives at KELLOGS QUERETARO
  → T-005.rutas_semana = 1
  → rutas_activas: T-010 | R-0001 | ELAM → KELLOGS  ← Only T-010 remains

Monday 14:00 - T-010 arrives at KELLOGS QUERETARO
  → T-010.rutas_semana = 1
  → rutas_activas: (empty)
```

Result: Both units completed the same route (R-0001) and both get credit.

---

## Weekly Counter Behavior

**Counter Scope:** Per-unit, per-week

**Reset:** Every Monday at 00:00 (Mexico timezone)

**Example Weekly Progression:**
```
Monday:    T-005 completes R-0001 → rutas_semana = 1
Tuesday:   T-005 completes R-0002 → rutas_semana = 2
Wednesday: T-005 completes R-0001 → rutas_semana = 3  (same route again)
Thursday:  T-005 completes R-0003 → rutas_semana = 4
Sunday:    T-005.rutas_semana = 4

Monday 00:00: Weekly reset runs
Monday 00:01: T-005.rutas_semana = 0  (fresh start)
```

---

## Edge Cases

### 1. Unit Starts Multiple Routes
**Problem:** Unit enters origin of R-0001, then enters origin of R-0002 before completing R-0001.

**Current Behavior:** Creates second active route, unit now tracks both simultaneously.

**Recommended Fix:** Check if unit already has active route before creating new one (prevent double-tracking). This is noted in the workflow code comments.

### 2. Route Never Completed
**Problem:** Unit starts route but never reaches destination.

**Current Behavior:** Record stays in rutas_activas indefinitely.

**Recommended Fix:** Add cleanup workflow to delete active routes older than 48 hours (documented as future enhancement).

### 3. Multiple Routes with Same Origin
**Problem:** R-0001, R-0002, and R-0003 all have "ELAM FAW STEP JAL" as origin but different destinations.

**Current Behavior:** Google Sheets lookup will return the FIRST matching route (usually the one with lowest ruta_id).

**Solution:**
- Option A: Make route origins unique
- Option B: Update workflow to handle multiple matches (e.g., check if unit's last known location suggests which route is most likely)

### 4. Geofence Name Mismatch
**Problem:** Route has origen="ELAM JAL" but actual geofence is named "ELAM FAW STEP JAL"

**Behavior:** Route will NEVER be detected (exact match required).

**Solution:** Ensure origen/destino names EXACTLY match geocercas.nombre (case-sensitive, space-sensitive).

---

## Configuration in rutas_programadas Sheet

### Option 1: Leave unidad Empty (Recommended)
```csv
ruta_id,unidad,origen,destino,cliente
R-0001,,ELAM FAW STEP JAL,KELLOGS QUERETARO,Kellogs
R-0002,,ELAM FAW STEP JAL,MABE SAN LUIS POTOSI,Mabe
R-0003,,ELAM FAW STEP JAL,HONDA CELAYA,Honda
```
This makes it crystal clear that any unit can complete any route.

### Option 2: Use unidad for Planning
```csv
ruta_id,unidad,origen,destino,cliente
R-0001,T-005,ELAM FAW STEP JAL,KELLOGS QUERETARO,Kellogs
R-0002,T-010,ELAM FAW STEP JAL,MABE SAN LUIS POTOSI,Mabe
R-0003,T-001,ELAM FAW STEP JAL,HONDA CELAYA,Honda
```
This documents which unit is PLANNED to do the route, but the system will still allow ANY unit to complete it.

---

## Testing Checklist

### Test 1: Any Unit Can Start Route
- [ ] Define route R-0001 with origen="ELAM FAW STEP JAL"
- [ ] Simulate T-005 entering ELAM FAW STEP JAL
- [ ] Verify rutas_activas shows: T-005 | R-0001
- [ ] Simulate T-010 entering ELAM FAW STEP JAL
- [ ] Verify rutas_activas shows: T-005 | R-0001, T-010 | R-0001

### Test 2: Route Completion
- [ ] Simulate T-005 entering destination geofence
- [ ] Verify rutas_completadas_log has entry for T-005 | R-0001
- [ ] Verify T-005.rutas_semana incremented
- [ ] Verify T-005 removed from rutas_activas
- [ ] Verify T-010 still in rutas_activas (not affected)

### Test 3: Weekly Counter
- [ ] Set T-005.rutas_semana = 3 (Friday)
- [ ] Wait for Monday 00:00 or manually trigger reset workflow
- [ ] Verify T-005.rutas_semana = 0 after reset
- [ ] Verify rutas_completadas_log still has historical data

### Test 4: Dashboard Display
- [ ] Complete a route with T-005
- [ ] Refresh dashboard
- [ ] Verify T-005 card shows "1 ruta completada esta semana"
- [ ] Verify table shows T-005 | Rutas (semana) = 1

---

## Summary

✅ **Any unit** can complete **any route**
✅ Routes defined by **origin + destination** only
✅ Unit assignment in rutas_programadas is **optional/informational**
✅ System tracks **which actual unit** started and completed the route
✅ Weekly counter is **per-unit** (each unit has their own count)
✅ Multiple units can do the same route simultaneously

🔄 **Automatic Flow:**
Unit enters origin → Route starts → Unit reaches destination → Route completes → Counter increments → Monday reset

📊 **Result:** Dashboard shows weekly route completions for each unit, regardless of which routes they were "assigned" to complete.
