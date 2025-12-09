# Phase 2: n8n Driver Bot Workflow Guide

## Overview

**Goal:** Build the complete driver bot with:
- Main menu with inline buttons
- Pause reporting (4 types)
- Incident reporting (6 types)
- Emergency SOS button
- Google Sheets integration

**Time:** 12-15 hours
**Prerequisites:** Phase 1 complete ✅

---

## Step 1: Add Telegram Credentials to n8n (15 min)

### 1.1 Access n8n
1. Open your n8n instance: `https://elam-logistic.app.n8n.cloud`
2. Login with your credentials
3. Click on your profile (bottom left) → Settings → Credentials

### 1.2 Add Driver Bot Credential
1. Click "Add Credential"
2. Search for "Telegram"
3. Select "Telegram API"
4. Fill in:
   - **Credential Name:** `Telegram Bot Conductores`
   - **Access Token:** `REDACTED_REVOKED_DRIVER_BOT_TOKEN`
5. Click "Test credential" (should see ✓ Success)
6. Click "Save"

### 1.3 Add Dispatcher Bot Credential
1. Click "Add Credential" again
2. Select "Telegram API"
3. Fill in:
   - **Credential Name:** `Telegram Bot Despachadores`
   - **Access Token:** `REDACTED_REVOKED_DISPATCHER_BOT_TOKEN`
4. Test and Save

### 1.4 Add Environment Variable for Chat ID
1. Settings → Environment Variables
2. Click "Add Variable"
3. Fill in:
   - **Name:** `CHAT_ID_GRUPO`
   - **Value:** `-5041344298`
   - **Type:** String
4. Save

**Checkpoint:**
- [ ] Telegram Bot Conductores credential added and tested
- [ ] Telegram Bot Despachadores credential added and tested
- [ ] CHAT_ID_GRUPO environment variable added

---

## Step 2: Create Base Driver Bot Workflow (30 min)

### 2.1 Create New Workflow
1. In n8n, click "+" to create new workflow
2. Name it: `ELAM - Telegram Bot Conductores`
3. Save (Ctrl+S or Cmd+S)

### 2.2 Add Telegram Trigger Node
1. Click the "+" button to add first node
2. Search: "Telegram Trigger"
3. Select "Telegram Trigger"
4. Configure:
   - **Credential:** Select "Telegram Bot Conductores"
   - **Updates:** Check both:
     - ☑ message
     - ☑ callback_query
5. Node should turn green (means it's listening)

### 2.3 Add "Get User Info" Code Node
1. Add new node after Telegram Trigger
2. Search: "Code"
3. Select "Code"
4. Rename node: "Get User Info"
5. Paste this code:

```javascript
// Extract user info from Telegram message or callback query
const userId = $json.message?.from?.id || $json.callback_query?.from?.id;
const chatId = $json.message?.chat?.id || $json.callback_query?.message?.chat?.id;
const username = $json.message?.from?.username || $json.callback_query?.from?.username;
const messageText = $json.message?.text || '';
const callbackData = $json.callback_query?.data || '';

return {
  json: {
    user_id: userId,
    chat_id: chatId,
    username: username ? `@${username}` : 'Sin username',
    message_text: messageText,
    callback_data: callbackData,
    full_message: $json
  }
};
```

6. Click "Execute node" to test
7. Should see user_id, chat_id extracted

### 2.4 Add Google Sheets Lookup Node
1. Add new node: "Google Sheets"
2. Rename: "Lookup User"
3. Configure:
   - **Credential:** Select your existing Google Sheets credential
   - **Operation:** Lookup
   - **Document ID:** `1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE`
   - **Sheet Name:** `user_mapping`
   - **Lookup Column:** `telegram_id`
   - **Lookup Value:** `={{$json.user_id}}`

**Note:** If you don't have pilot drivers in user_mapping yet, add yourself for testing:
- Go to Google Sheets → user_mapping
- Add a test row with YOUR telegram ID (use @userinfobot to get it)

### 2.5 Add Validation IF Node
1. Add new node: "IF"
2. Rename: "User Authorized?"
3. Configure:
   - **Condition:** String
   - **Value 1:** `={{$json.rol}}`
   - **Operation:** Equal
   - **Value 2:** `conductor`
4. This splits into TRUE (authorized) and FALSE (unauthorized) paths

### 2.6 Add Unauthorized Message (FALSE path)
1. From FALSE output, add node: "Telegram"
2. Rename: "Send Unauthorized Message"
3. Configure:
   - **Credential:** Telegram Bot Conductores
   - **Operation:** Send Message
   - **Chat ID:** `={{$('Get User Info').item.json.chat_id}}`
   - **Text:**
```
❌ Acceso No Autorizado

Lo siento, no tienes permiso para usar este bot.

Contacta al administrador si crees que esto es un error.
```

### 2.7 Save and Test
1. Save workflow (Ctrl+S)
2. Activate workflow (toggle in top right)
3. Send a message to your driver bot in Telegram: `/start`
4. Check n8n executions log (click "Executions" tab)
5. Should see the execution flow

**Checkpoint:**
- [ ] Workflow created and saved
- [ ] Telegram Trigger receiving messages
- [ ] User ID extracted correctly
- [ ] Google Sheets lookup working
- [ ] Authorization check working
- [ ] Unauthorized users get error message

---

## Step 3: Build Main Menu (1 hour)

### 3.1 Add Switch Node for Routing
1. From TRUE output of IF node, add: "Switch"
2. Rename: "Route Handler"
3. Configure multiple routes (click "Add Routing Rule"):

**Rule 1:** Start Command
- Mode: Expression
- Value: `={{$('Get User Info').item.json.message_text}} === '/start' || {{$('Get User Info').item.json.callback_data}} === 'start'`
- Output: 0

**Rule 2:** Pause Menu
- Mode: Expression
- Value: `={{$('Get User Info').item.json.callback_data}} === 'menu_pausas'`
- Output: 1

**Rule 3:** Process Pause
- Mode: Expression
- Value: `={{$('Get User Info').item.json.callback_data}}.startsWith('pausa_')`
- Output: 2

**Rule 4:** Incident Menu
- Mode: Expression
- Value: `={{$('Get User Info').item.json.callback_data}} === 'menu_incidentes'`
- Output: 3

**Rule 5:** Process Incident
- Mode: Expression
- Value: `={{$('Get User Info').item.json.callback_data}}.startsWith('incidente_')`
- Output: 4

**Rule 6:** Emergency
- Mode: Expression
- Value: `={{$('Get User Info').item.json.callback_data}} === 'emergencia'`
- Output: 5

**Fallback:** Help/Unknown
- Output: 6

### 3.2 Create Main Menu Handler
1. From Output 0 (Start), add node: "Telegram"
2. Rename: "Show Main Menu"
3. Configure:
   - **Credential:** Telegram Bot Conductores
   - **Operation:** Send Message
   - **Chat ID:** `={{$('Get User Info').item.json.chat_id}}`
   - **Parse Mode:** Markdown
   - **Text:**
```
🚛 *Bienvenido al Sistema ELAM Fleet*

👤 Conductor: {{$('Lookup User').item.json.nombre}}
🚚 Unidad: {{$('Lookup User').item.json.unidad}}

📱 Usa los botones para reportar:
```

   - **Reply Markup:** Custom (JSON)
   - Click "Add Option" and paste:

```json
{
  "inline_keyboard": [
    [{"text": "📍 Reportar Ubicación", "callback_data": "reportar_ubicacion"}],
    [{"text": "⏸️ Registrar Pausa", "callback_data": "menu_pausas"}],
    [{"text": "⚠️ Reportar Incidente", "callback_data": "menu_incidentes"}],
    [{"text": "🆘 EMERGENCIA", "callback_data": "emergencia"}],
    [{"text": "ℹ️ Ayuda", "callback_data": "ayuda"}]
  ]
}
```

### 3.3 Test Main Menu
1. Save workflow
2. In Telegram, send `/start` to your driver bot
3. Should receive menu with 5 buttons
4. Click any button → n8n should receive callback_query

**Checkpoint:**
- [ ] Main menu appears with 5 buttons
- [ ] Buttons are clickable
- [ ] Driver name and unit shown correctly
- [ ] Markdown formatting works

---

## Step 4: Build Pause System (2-3 hours)

This is detailed work - I'll break it into substeps...

### 4.1 Create Pause Menu
1. From Output 1 (Pause Menu), add node: "Telegram"
2. Rename: "Show Pause Menu"
3. Configure:
   - **Operation:** Edit Message Text
   - **Chat ID:** `={{$('Get User Info').item.json.chat_id}}`
   - **Message ID:** `={{$('Get User Info').item.json.full_message.callback_query.message.message_id}}`
   - **Text:** `⏸️ *Selecciona el tipo de pausa:*`
   - **Reply Markup:**

```json
{
  "inline_keyboard": [
    [{"text": "🚻 Parada al baño", "callback_data": "pausa_bano"}],
    [{"text": "⛽ Combustible", "callback_data": "pausa_combustible"}],
    [{"text": "🍽️ Comida", "callback_data": "pausa_comida"}],
    [{"text": "😴 Descanso obligatorio", "callback_data": "pausa_descanso"}],
    [{"text": "◀️ Volver", "callback_data": "start"}]
  ]
}
```

### 4.2 Create Pause Processor
1. From Output 2 (Process Pause), add: "Code"
2. Rename: "Process Pause Data"
3. Paste code:

```javascript
const callbackData = $('Get User Info').item.json.callback_data;
const tipoPausa = callbackData.replace('pausa_', '');

const duraciones = {
  'bano': 10,
  'combustible': 15,
  'comida': 30,
  'descanso': 120
};

const nombres = {
  'bano': { emoji: '🚻', nombre: 'Parada al baño' },
  'combustible': { emoji: '⛽', nombre: 'Combustible' },
  'comida': { emoji: '🍽️', nombre: 'Comida' },
  'descanso': { emoji: '😴', nombre: 'Descanso obligatorio' }
};

const userData = $('Lookup User').item.json;
const now = new Date();

return {
  json: {
    // User info
    telegram_user_id: $('Get User Info').item.json.user_id,
    unidad: userData.unidad,
    operador: userData.nombre,
    telefono: userData.telefono,

    // Pause info
    tipo_pausa: tipoPausa,
    duracion_estimada: duraciones[tipoPausa],
    emoji: nombres[tipoPausa].emoji,
    nombre_pausa: nombres[tipoPausa].nombre,

    // Timestamps
    timestamp_inicio: now.toISOString(),
    hora_inicio_formatted: now.toLocaleString('es-MX', {timeZone: 'America/Mexico_City'}),

    // For sheets
    activa: true,
    chat_id: $('Get User Info').item.json.chat_id
  }
};
```

### 4.3 Save to pausas_activas Sheet
1. Add node: "Google Sheets"
2. Rename: "Save to pausas_activas"
3. Configure:
   - **Operation:** Append
   - **Document ID:** `1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE`
   - **Sheet Name:** `pausas_activas`
   - **Columns:**
     - unidad: `={{$json.unidad}}`
     - tipo_pausa: `={{$json.tipo_pausa}}`
     - hora_inicio: `={{$json.timestamp_inicio}}`
     - duracion_estimada: `={{$json.duracion_estimada}}`
     - ubicacion_lat: Leave empty (will implement later)
     - ubicacion_lng: Leave empty
     - activa: `TRUE`
     - hora_fin_real: Leave empty

### 4.4 Also Log to reportes_conductores
1. Add another Google Sheets node (parallel to previous)
2. Rename: "Log to reportes_conductores"
3. Configure:
   - **Operation:** Append
   - **Sheet Name:** `reportes_conductores`
   - **Columns:**
     - id: `={{$json.unidad}}-{{Date.now()}}`
     - timestamp: `={{$json.timestamp_inicio}}`
     - telegram_user_id: `={{$json.telegram_user_id}}`
     - unidad: `={{$json.unidad}}`
     - operador: `={{$json.operador}}`
     - tipo_reporte: `pausa_{{$json.tipo_pausa}}`
     - ubicacion_lat: Leave empty
     - ubicacion_lng: Leave empty
     - tiempo_estimado: `={{$json.duracion_estimada}}`
     - status: `ACTIVO`
     - notas: `={{$json.nombre_pausa}}`

### 4.5 Send Confirmation to Driver
1. After both sheets nodes, add: "Telegram"
2. Rename: "Confirm Pause Registered"
3. Configure:
   - **Operation:** Send Message
   - **Chat ID:** `={{$json.chat_id}}`
   - **Parse Mode:** Markdown
   - **Text:**

```
✅ {{$json.emoji}} *{{$json.nombre_pausa}} registrada*

⏱️ Duración estimada: *{{$json.duracion_estimada}} minutos*
🕐 Hora: {{$json.hora_inicio_formatted}}
📍 Ubicación guardada

⚠️ No olvides marcar cuando reanudes
```

   - **Reply Markup:**

```json
{
  "inline_keyboard": [
    [{"text": "✅ Reanudar viaje", "callback_data": "reanudar_pausa"}],
    [{"text": "◀️ Menú Principal", "callback_data": "start"}]
  ]
}
```

### 4.6 Test Pause Flow
1. Save workflow
2. In Telegram: `/start` → Click "⏸️ Registrar Pausa"
3. Select a pause type (e.g., "🚻 Baño")
4. Check:
   - [ ] pausas_activas sheet has new row
   - [ ] reportes_conductores has log entry
   - [ ] Confirmation message appears
   - [ ] Duration is correct (10 min for baño)

**Checkpoint:**
- [ ] Pause menu appears with 4 types
- [ ] Selecting a pause saves to pausas_activas
- [ ] Data logs to reportes_conductores
- [ ] Confirmation shows correct emoji and duration
- [ ] "Reanudar" button appears

---

## Next Steps in Phase 2

After completing the pause system, you'll build:
1. **Incident System** (similar structure, 6 types)
2. **Emergency Button** (highest priority)
3. **Resume Journey** handler (sets activa=FALSE)

---

## Estimated Time Breakdown

| Task | Time |
|------|------|
| n8n credentials setup | 15 min |
| Base workflow creation | 30 min |
| Main menu | 1 hour |
| Pause system | 2-3 hours |
| Incident system | 2-3 hours |
| Emergency system | 1-2 hours |
| Testing with pilots | 2-3 hours |
| **Total** | **12-15 hours** |

---

## Save Points

**After each major section, export your workflow:**
1. Workflows → Select your workflow
2. Click "..." menu → Download
3. Save as: `ELAM-Telegram-Bot-Conductores-v1-[date].json`
4. Store in `/workflows/backups/`

---

## Troubleshooting

**Telegram Trigger not receiving messages:**
- Check credential is selected
- Make sure workflow is ACTIVATED (toggle on)
- Test: Send /start and check Executions tab

**Google Sheets lookup fails:**
- Verify sheet name exactly matches: `user_mapping`
- Check telegram_id column is formatted as Plain Text
- Add test user with your own Telegram ID

**Buttons don't work:**
- Verify JSON is valid (no syntax errors)
- Check callback_data matches Switch conditions
- Test one button at a time

**"Node didn't return data":**
- This is normal if condition doesn't match
- Check Switch routing expressions
- Add fallback route for debugging

---

## Ready to Build?

Start with **Step 1: Add Telegram Credentials** and work through sequentially.

After completing the pause system, come back and I'll guide you through incident and emergency systems!

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Completed
