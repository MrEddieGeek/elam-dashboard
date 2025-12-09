# Google Sheets Setup Guide - Phase 1

## Your Spreadsheet

**ID:** `1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE`
**URL:** https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit

---

## Step 1: Create 5 New Sheets

1. Open your Google Spreadsheet (click URL above)
2. At the bottom, click the `+` icon 5 times to create 5 new sheets
3. Rename them exactly as shown below (right-click → Rename):
   - `user_mapping`
   - `reportes_conductores`
   - `pausas_activas`
   - `incidentes`
   - `emergencias`

---

## Step 2: Set Up user_mapping Sheet

1. Click on the `user_mapping` sheet tab
2. In row 1, add these headers (one per column):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| telegram_id | username | nombre | rol | unidad | telefono |

3. Add example data in row 2 (you'll replace this later):

| telegram_id | username | nombre | rol | unidad | telefono |
|-------------|----------|---------|------|--------|----------|
| 123456789 | @example | Ejemplo | conductor | T-001 | +525512345678 |

4. Format the telegram_id column:
   - Select column A
   - Format → Number → Plain text (to prevent scientific notation)

---

## Step 3: Set Up reportes_conductores Sheet

Click `reportes_conductores` tab and add headers:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| id | timestamp | telegram_user_id | unidad | operador | tipo_reporte | ubicacion_lat | ubicacion_lng | tiempo_estimado | status | notas |

**No example data needed** - this will be populated by the bot

---

## Step 4: Set Up pausas_activas Sheet

Click `pausas_activas` tab and add headers:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| unidad | tipo_pausa | hora_inicio | duracion_estimada | ubicacion_lat | ubicacion_lng | activa | hora_fin_real |

**No example data needed**

---

## Step 5: Set Up incidentes Sheet

Click `incidentes` tab and add headers:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | timestamp | unidad | tipo_incidente | severidad | ubicacion_lat | ubicacion_lng | descripcion | status |

**No example data needed**

---

## Step 6: Set Up emergencias Sheet

Click `emergencias` tab and add headers:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | timestamp_inicio | unidad | operador | ubicacion_lat | ubicacion_lng | status | despachador_asignado | timestamp_resolucion | llamada_realizada |

**No example data needed**

---

## Step 7: Format All Sheets

For **each of the 5 sheets**:

1. Select row 1 (the header row)
2. Format → Text → Bold
3. Format → Fill color → Light blue (or your preference)
4. View → Freeze → 1 row (keeps headers visible when scrolling)

---

## Step 8: Protect Existing Sheets (Optional but Recommended)

To prevent accidental changes to your existing working sheets:

1. Right-click on existing sheet tabs (status_operativo, live_data, etc.)
2. Protect sheet
3. Set permissions: "Only you" or "Custom" (select editors)
4. Save

**DO NOT protect the 5 new sheets** - n8n needs to write to them

---

## Step 9: Verify Setup

Check that you have these sheets in your spreadsheet:

**Existing (10 sheets):**
- ✓ status_operativo
- ✓ live_data
- ✓ geocercas
- ✓ unidades_operadores
- ✓ eventos_log
- ✓ mapeo_status
- ✓ parametros_costos
- ✓ costos_ingresos
- ✓ mantenimientos
- ✓ rutas_programadas

**New (5 sheets):**
- ⬜ user_mapping (with headers)
- ⬜ reportes_conductores (with headers)
- ⬜ pausas_activas (with headers)
- ⬜ incidentes (with headers)
- ⬜ emergencias (with headers)

**Total:** 15 sheets

---

## Step 10: Populate user_mapping (After Collecting User IDs)

Once you have all User IDs from drivers and dispatchers:

1. Go to `user_mapping` sheet
2. Delete the example row (row 2)
3. Add real data for each person:

**Example:**
| telegram_id | username | nombre | rol | unidad | telefono |
|-------------|----------|---------|------|--------|----------|
| 123456789 | @juan | Juan Pérez | conductor | T-001 | +525512345678 |
| 987654321 | @maria | María López | conductor | T-002 | +525587654321 |
| 111222333 | @carlos | Carlos Ruiz | despachador | N/A | +525511112222 |

4. Add all 18 drivers + 2-3 dispatchers
5. Double-check:
   - telegram_id is a number (no quotes)
   - rol is exactly "conductor" or "despachador" (lowercase)
   - unidad format: T-001 to T-018 (or N/A for dispatchers)
   - telefono includes country code: +52...

---

## Quick Import Method (Alternative)

If you prefer to import from CSV:

1. I've created templates in `/templates/` directory
2. Fill them with your data
3. In Google Sheets: File → Import
4. Upload the CSV file
5. Import location: "Replace current sheet"
6. Repeat for each sheet

---

## Troubleshooting

**telegram_id shows as 1.23E+09:**
- Select the column
- Format → Number → Plain text

**Headers not bold:**
- Select row 1 → Format → Text → Bold

**Can't find the + button to add sheets:**
- Bottom left corner of Google Sheets
- Or: Right-click any sheet tab → "Insert sheet"

---

## Time Estimate

- Creating 5 sheets: 5 minutes
- Adding headers: 10 minutes
- Formatting: 5 minutes
- **Total: ~20 minutes**

---

## Next Steps

After sheets are set up:
1. ✅ Collect User IDs from team
2. ✅ Populate user_mapping sheet
3. ✅ Verify all data is correct
4. ✅ Move to n8n workflow setup (Phase 2)

---

**Sheet Setup Status:**
- [X] All 5 sheets created
- [X] All headers added
- [X] Formatting applied
- [X] Freezing applied
- [ ] user_mapping populated with real data
- [ ] Data verified

**Completed:** 12/01/2025
