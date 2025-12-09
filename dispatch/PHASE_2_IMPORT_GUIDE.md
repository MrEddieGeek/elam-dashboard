# Phase 2: n8n Import & Setup Guide

**Estimated Time:** 40 minutes
**Prerequisites:** Phase 1 completed ✅

---

## 📋 Overview

This guide will walk you through importing the enhanced Phase 2 workflow into n8n and getting it production-ready.

### What You'll Do:
1. Import the workflow JSON file to n8n
2. Configure 2 credentials (Telegram + Google Sheets)
3. Add a test driver to user_mapping sheet
4. Activate the workflow
5. Test all features

---

## Step 1: Import Workflow to n8n (5 min)

### 1.1 Access n8n
1. Open browser and go to: `https://elam-logistic.app.n8n.cloud`
2. Log in with your credentials

### 1.2 Import Workflow
1. In n8n, click **"Workflows"** in the left sidebar
2. Click the **"Import from File"** button (top right)
3. Navigate to: `/home/mreddie/Documents/Recursiones/ELAM/elam-dashboard/workflows/`
4. Select: **`ELAM_Telegram_Bot_Conductores_PHASE2_ENHANCED.json`**
5. Click **"Open"** or **"Import"**

### 1.3 Verify Import
You should see a workflow canvas with:
- **28 nodes** total
- Main flow from left to right
- Multiple branches for different features

**✅ Checkpoint:**
- [X] Workflow appears in canvas
- [X] All nodes visible (may show red/yellow warnings - this is normal)
- [X] Workflow name: "ELAM - Telegram Bot Conductores"

---

## Step 2: Configure Credentials (10 min)

After import, many nodes will show **red warnings** because credentials need to be configured. You need to set up 2 credentials.

### 2.1 Configure Telegram Credential

**Nodes that need this:** 10 nodes
- Telegram Trigger
- Show Main Menu
- Show Pause Menu
- Confirm Pause Registered
- Show Incident Menu
- Confirm Incident Reported
- Confirm Emergency Activated
- Show Help
- Confirm Resume
- Request Location

**Setup Steps:**
1. Click on any red **Telegram** node (e.g., "Telegram Trigger")
2. In the parameters panel (right side), find **"Credential to connect with"**
3. Click the dropdown
4. If you already have "Telegram Bot Conductores" credential:
   - **Select it** from the list
   - Click outside the panel to save
5. If you DON'T have it yet:
   - Click **"Create New"**
   - Select **"Telegram API"**
   - Name: `Telegram Bot Conductores`
   - Access Token: `REDACTED_REVOKED_DRIVER_BOT_TOKEN`
   - Click **"Save"**

**Important:** Once you configure ONE Telegram node, you still need to update the others:
1. Click each remaining red Telegram node
2. Select "Telegram Bot Conductores" from dropdown
3. Repeat for all 10 Telegram nodes

**💡 Pro Tip:** Use Ctrl+F (Cmd+F on Mac) to search for "Telegram" and jump between nodes quickly.

### 2.2 Configure Google Sheets Credential

**Nodes that need this:** 7 nodes
- Lookup User
- Save to pausas_activas
- Log to reportes_conductores
- Save to incidentes
- Save to emergencias
- Find Active Pause
- Mark Pause as Inactive
- Log Incident to reportes_conductores

**Setup Steps:**
1. Click on any red **Google Sheets** node (e.g., "Lookup User")
2. Find **"Google Sheets OAuth2 API"** credential field
3. If you already have "Google Sheets ELAM" credential:
   - **Select it** from dropdown
4. If you DON'T have it:
   - Click **"Create New"**
   - Select **"Google Sheets OAuth2 API"**
   - Name: `Google Sheets ELAM`
   - Follow OAuth2 flow to authorize n8n to access your Google Sheets
   - Click **"Save"**

**Repeat for all 7 Google Sheets nodes.**

### 2.3 Verify All Credentials Set
After configuring, **no nodes should be red**:
- Green = Working
- Gray = Not executed yet (normal)
- Yellow = Warning (usually harmless)
- Red = Missing credential or error

**✅ Checkpoint:**
- [X] All 10 Telegram nodes have credential
- [X] All 7 Google Sheets nodes have credential
- [ ] No red nodes remaining
- [X] Workflow can be saved (Ctrl+S)

---

## Step 3: Add Test Driver (5 min)

Before testing, you need to add yourself as a test driver in the `user_mapping` sheet.

### 3.1 Get Your Telegram ID
1. Open Telegram
2. Search for: `@userinfobot`
3. Start the bot and click **"Start"**
4. Copy your **User ID** (e.g., `123456789`)

### 3.2 Add to Google Sheets
1. Open: https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
2. Go to the **`user_mapping`** tab
3. Add a new row at the bottom:

| telegram_id | username | nombre | rol | unidad | telefono |
|-------------|----------|---------|------------|---------|----------|
| [Your ID] | @yourname | Your Name | conductor | T-TEST | 5555555555 |

**Example:**
```
telegram_id: 123456789
username: @johndriver
nombre: John Test Driver
rol: conductor
unidad: T-TEST
telefono: 5551234567
```

**Important:**
- `rol` MUST be exactly `conductor` (lowercase)
- `telegram_id` must match what you got from @userinfobot

**✅ Checkpoint:**
- [ ] Your Telegram ID added to user_mapping
- [ ] rol = "conductor"
- [ ] All fields filled

---

## Step 4: Activate Workflow (1 min)

### 4.1 Save Workflow
1. In n8n, press **Ctrl+S** (or Cmd+S) to save
2. Verify workflow name shows at top

### 4.2 Activate
1. Find the toggle switch in the **top right** corner
2. Click to turn it **ON** (should turn green/blue)
3. Status should change to **"Active"**

**✅ Checkpoint:**
- [ ] Workflow saved
- [ ] Toggle is ON (Active)
- [ ] "Listening" indicator appears on Telegram Trigger

---

## Step 5: Test All Features (20 min)

### 5.1 Initial Test - Main Menu
1. Open Telegram
2. Search for: `@ELAMFleetConductores_bot`
3. Send message: `/start`

**Expected Result:**
```
🚛 Bienvenido al Sistema ELAM Fleet

👤 Conductor: [Your Name]
🚚 Unidad: T-TEST

📱 Usa los botones para reportar:
```
With 5 buttons:
- 📍 Reportar Ubicación
- ⏸️ Registrar Pausa
- ⚠️ Reportar Incidente
- 🆘 EMERGENCIA
- ℹ️ Ayuda

**❌ If you get "Acceso No Autorizado":**
- Check user_mapping sheet has your correct telegram_id
- Verify rol="conductor" (exactly, lowercase)
- Refresh the sheet and try again

### 5.2 Test Pause System
1. Click **"⏸️ Registrar Pausa"**
2. Select **"🚻 Parada al baño"**

**Expected:**
- Confirmation message appears
- Shows: duration (10 min), time, "Reanudar viaje" button

3. **Check Google Sheets** → `pausas_activas` tab
   - New row should appear
   - `activa` = TRUE
   - `tipo_pausa` = "bano"
   - `duracion_estimada` = 10

4. **Check Google Sheets** → `reportes_conductores` tab
   - New row with tipo_reporte = "pausa_bano"

5. Click **"✅ Reanudar viaje"** button

**Expected:**
- Confirmation: "✅ Pausa finalizada"

6. **Check Google Sheets** → `pausas_activas`
   - Same row now has:
   - `activa` = FALSE
   - `hora_fin_real` = [current time]

**✅ Test Checklist - Pause System:**
- [ ] Pause menu shows 4 types
- [ ] Selecting pause saves to pausas_activas (activa=TRUE)
- [ ] Log appears in reportes_conductores
- [ ] Confirmation message correct
- [ ] "Reanudar" button works
- [ ] Pause updated to activa=FALSE after resume

### 5.3 Test Incident System
1. Send `/start` again (or click "◀️ Menú Principal")
2. Click **"⚠️ Reportar Incidente"**
3. Select **"🚗 Tráfico pesado"**

**Expected:**
- Confirmation message
- Shows: type, severity, unit, operator, time
- Message: "Despacho ha sido notificado"

4. **Check Google Sheets** → `incidentes` tab
   - New row with:
   - `tipo_incidente` = "trafico"
   - `severidad` = "media"
   - `status` = "ACTIVO"

5. **Check Google Sheets** → `reportes_conductores` tab
   - New row with tipo_reporte = "incidente_trafico"

6. **Check n8n Executions** (left sidebar → "Executions")
   - Should see the workflow execution
   - "Notify Dispatchers (Incident)" node may show warning (expected - Phase 3 will create endpoint)

**✅ Test Checklist - Incident System:**
- [ ] Incident menu shows 6 types
- [ ] Selecting incident saves to `incidentes` sheet
- [ ] Log appears in `reportes_conductores`
- [ ] Confirmation message correct
- [ ] n8n shows execution (even if HTTP fails)

### 5.4 Test Emergency Button
1. Go back to main menu
2. Click **"🆘 EMERGENCIA"**

**Expected:**
- Urgent confirmation message
- Shows: "EMERGENCIA ACTIVADA", "Despacho notificado"
- Emergency ID shown (format: EMG-[timestamp])

3. **Check Google Sheets** → `emergencias` tab
   - New row with:
   - `id` = EMG-[timestamp]
   - `status` = "ACTIVA"
   - `unidad` = T-TEST
   - `llamada_realizada` = FALSE

4. **Check n8n Executions**
   - "Notify Dispatchers (Emergency)" may show warning (expected)

**✅ Test Checklist - Emergency System:**
- [ ] Emergency button creates record
- [ ] ID format correct (EMG-[timestamp])
- [ ] Saves to `emergencias` sheet
- [ ] status = "ACTIVA"
- [ ] Confirmation message shown

### 5.5 Test Help Menu
1. Main menu → Click **"ℹ️ Ayuda"**

**Expected:**
- Detailed help text showing:
  - Available commands
  - Feature descriptions
  - Contact info
  - Back button

**✅ Test Checklist - Help:**
- [ ] Help text appears
- [ ] All features explained
- [ ] Back button works

### 5.6 Test Location Request
1. Main menu → Click **"📍 Reportar Ubicación"**

**Expected:**
- Message: "📍 Compartir Ubicación"
- Custom keyboard appears with:
  - "📍 Enviar mi ubicación" button
  - "❌ Cancelar" button

**Note:** Actual location saving will be implemented when we add the location message handler in a future phase.

**✅ Test Checklist - Location:**
- [ ] Request message appears
- [ ] Keyboard with location button shows

---

## Step 6: Review Test Results (5 min)

### 6.1 Check n8n Executions
1. In n8n, click **"Executions"** (left sidebar)
2. You should see all your test executions
3. Click on each to see the flow:
   - Green nodes = Success
   - Yellow nodes = Warning (OK if it's the HTTP webhooks)
   - Red nodes = Error (investigate)

**Expected Warnings:**
- "Notify Dispatchers (Incident)" - 404 error (webhook doesn't exist yet)
- "Notify Dispatchers (Emergency)" - 404 error (webhook doesn't exist yet)

These are **NORMAL** - Phase 3 will create these webhooks.

### 6.2 Check Google Sheets Data
Verify all sheets have test data:

**`user_mapping`:**
- Your test driver row

**`pausas_activas`:**
- At least 1 pause with activa=FALSE

**`reportes_conductores`:**
- 2+ rows (1 pause + 1 incident)

**`incidentes`:**
- At least 1 incident

**`emergencias`:**
- At least 1 emergency

### 6.3 Final Checks
**✅ Phase 2 Completion Checklist:**
- [ ] Workflow imported successfully
- [ ] All 28 nodes present
- [ ] All credentials configured (no red nodes)
- [ ] Workflow activated
- [ ] Main menu works
- [ ] Pause system works (register + resume)
- [ ] Incident system works (6 types)
- [ ] Emergency button works
- [ ] Help menu works
- [ ] Location request works
- [ ] Data appears in all 4 sheets
- [ ] n8n executions show successful flows

---

## Troubleshooting

### Problem: "Acceso No Autorizado" message
**Solution:**
1. Verify your telegram_id in user_mapping sheet
2. Check rol="conductor" (lowercase, no spaces)
3. Try another Telegram user or use @userinfobot again to confirm ID

### Problem: Nodes showing red in n8n
**Solution:**
1. Click the red node
2. Check if credential is selected
3. If not, select from dropdown
4. Save workflow (Ctrl+S)

### Problem: Google Sheets not updating
**Solution:**
1. Check Google Sheets credential has edit permissions
2. Open the sheet manually and verify you can edit it
3. In n8n, re-test the credential (click "Test" button)
4. Check sheet names match exactly (case-sensitive)

### Problem: Buttons don't respond
**Solution:**
1. Check workflow is ACTIVE (toggle on)
2. Verify Telegram Trigger is green/listening
3. Check n8n Executions for errors
4. Try deactivating and reactivating workflow

### Problem: HTTP webhook returns 404
**Solution:**
- This is EXPECTED for Phase 2
- Incidents and emergencies will still save to sheets
- Phase 3 will create the dispatcher notification webhook
- You can continue testing other features

### Problem: Wrong unit name in messages
**Solution:**
1. Check your row in user_mapping has correct "unidad" field
2. Refresh the Google Sheet
3. Try /start again

---

## Next Steps After Phase 2

Once all tests pass:

### 1. Add Pilot Drivers (Week 2)
- Select 2-3 tech-savvy drivers
- Get their Telegram IDs (via @userinfobot)
- Add them to user_mapping sheet
- Train them on bot usage
- Monitor for 1 week
- Collect feedback

### 2. Start Phase 3 - Dispatcher Bot (Week 2-3)
Phase 3 will add:
- Dispatcher bot with /status, /alertas commands
- Notification webhook (that Phase 2 calls)
- "Atendido" buttons for incidents
- Group + DM notifications
- Real-time fleet dashboard

**Phase 3 Prerequisites:**
- Phase 2 fully tested ✅
- Pilot drivers onboarded ✅
- At least 20 real incidents/pauses logged ✅

---

## Support & Documentation

**Workflow Location:**
```
/home/mreddie/Documents/Recursiones/ELAM/elam-dashboard/workflows/ELAM_Telegram_Bot_Conductores_PHASE2_ENHANCED.json
```

**Documentation:**
- Full guide: `dispatch/PHASE_2_N8N_WORKFLOW_GUIDE.md`
- Implementation tracker: `dispatch/IMPLEMENTATION_TRACKER.md`
- Status summary: `dispatch/PHASE_2_IMPLEMENTATION_STATUS.md`

**Google Sheets:**
https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE

**Telegram Bots:**
- Driver bot: `@ELAMFleetConductores_bot`
- Dispatcher bot: `@ELAMFleetDespacho_bot` (Phase 3)

**n8n Instance:**
https://elam-logistic.app.n8n.cloud

---

## Success! 🎉

If all tests pass, **Phase 2 is complete!**

You now have a fully functional driver bot that can:
- ✅ Authenticate drivers
- ✅ Register and track pauses
- ✅ Report incidents
- ✅ Send emergency SOS
- ✅ Log all data to Google Sheets
- ✅ Attempt to notify dispatchers (Phase 3 will complete this)

**Time to celebrate and move to pilot testing!** 🚛📱

---

**Last Updated:** 2025-12-02
**Version:** 2.0 (Enhanced)
