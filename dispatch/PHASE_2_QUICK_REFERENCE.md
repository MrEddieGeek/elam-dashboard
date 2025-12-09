# Phase 2 - Quick Reference Cheat Sheet

## 🔑 Credentials
**Driver Bot Token:** `REDACTED_REVOKED_DRIVER_BOT_TOKEN`
**Dispatcher Bot Token:** `REDACTED_REVOKED_DISPATCHER_BOT_TOKEN`
**Chat ID:** `-5041344298`
**Sheet ID:** `1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE`

---

## 📊 Google Sheets Reference

### Sheet Names (case-sensitive!)
- `user_mapping`
- `reportes_conductores`
- `pausas_activas`
- `incidentes`
- `emergencias`

### Common Columns
```
pausas_activas: unidad, tipo_pausa, hora_inicio, duracion_estimada, ubicacion_lat, ubicacion_lng, activa, hora_fin_real

reportes_conductores: id, timestamp, telegram_user_id, unidad, operador, tipo_reporte, ubicacion_lat, ubicacion_lng, tiempo_estimado, status, notas

incidentes: id, timestamp, unidad, tipo_incidente, severidad, ubicacion_lat, ubicacion_lng, descripcion, status

emergencias: id, timestamp_inicio, unidad, operador, ubicacion_lat, ubicacion_lng, status, despachador_asignado, timestamp_resolucion, llamada_realizada
```

---

## 🎨 Pause Types & Durations

| Type | Duration | Emoji | Spanish |
|------|----------|-------|---------|
| bano | 10 min | 🚻 | Parada al baño |
| combustible | 15 min | ⛽ | Combustible |
| comida | 30 min | 🍽️ | Comida |
| descanso | 120 min | 😴 | Descanso obligatorio |

---

## ⚠️ Incident Types

| Type | Emoji | Spanish | Severity |
|------|-------|---------|----------|
| trafico | 🚗 | Tráfico pesado | media |
| obra | 🚧 | Desvío por obra | media |
| manifestacion | 🪧 | Desvío por manifestación | alta |
| clima | 🌧️ | Clima adverso | alta |
| mecanica | 🔧 | Falla mecánica menor | media |
| otro | 📝 | Otro | baja |

---

## 🔗 Common n8n Expressions

### Get User Data
```javascript
// From "Get User Info" node
{{$('Get User Info').item.json.user_id}}
{{$('Get User Info').item.json.chat_id}}
{{$('Get User Info').item.json.callback_data}}

// From "Lookup User" node
{{$('Lookup User').item.json.nombre}}
{{$('Lookup User').item.json.unidad}}
{{$('Lookup User').item.json.telefono}}
```

### Current Time
```javascript
// ISO format
{{new Date().toISOString()}}

// Mexico City time
{{new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'})}}

// Timestamp for IDs
{{Date.now()}}
```

### Generate IDs
```javascript
// Emergency ID
EMG-{{Date.now()}}

// Report ID
{{$json.unidad}}-{{Date.now()}}
```

---

## 📱 Telegram Inline Keyboard Template

```json
{
  "inline_keyboard": [
    [{"text": "Button Text", "callback_data": "callback_id"}],
    [{"text": "Another Button", "callback_data": "another_id"}]
  ]
}
```

**Multiple buttons per row:**
```json
{
  "inline_keyboard": [
    [
      {"text": "Button 1", "callback_data": "id1"},
      {"text": "Button 2", "callback_data": "id2"}
    ]
  ]
}
```

**With URL:**
```json
{
  "inline_keyboard": [
    [{"text": "📞 Llamar", "url": "tel:+525512345678"}],
    [{"text": "📍 Ver Mapa", "url": "https://www.google.com/maps?q=19.4326,-99.1332"}]
  ]
}
```

---

## 🎯 Switch Node Routing Examples

### Check for specific text
```javascript
={{$('Get User Info').item.json.message_text}} === '/start'
```

### Check callback starts with
```javascript
={{$('Get User Info').item.json.callback_data}}.startsWith('pausa_')
```

### Multiple conditions (OR)
```javascript
={{$('Get User Info').item.json.message_text}} === '/start' || {{$('Get User Info').item.json.callback_data}} === 'start'
```

---

## 🐛 Common Errors & Fixes

### "Node didn't return data"
✅ **Normal** - Means condition didn't match
✅ Add fallback route in Switch node

### "Cannot read property 'json' of undefined"
❌ Previous node has no data
✅ Check if previous node executed
✅ Verify expression references correct node name

### Telegram "Message not modified"
❌ Trying to edit message with same text
✅ Use "Send Message" instead of "Edit Message"
✅ Check if text actually changed

### Google Sheets "Sheet not found"
❌ Sheet name typo (case-sensitive!)
✅ Verify exact name: `user_mapping` not `User_Mapping`

### "Invalid credential"
❌ Credential not selected or wrong
✅ Re-select credential in dropdown
✅ Test credential in settings

---

## 📦 Code Snippets

### Extract callback_data type
```javascript
const callbackData = $('Get User Info').item.json.callback_data;
const type = callbackData.replace('pausa_', ''); // Gets "bano" from "pausa_bano"
```

### Build data for Google Sheets
```javascript
return {
  json: {
    unidad: $('Lookup User').item.json.unidad,
    timestamp: new Date().toISOString(),
    status: 'ACTIVO',
    // ... more fields
  }
};
```

### Format message with user data
```
🚛 *Bienvenido* {{$('Lookup User').item.json.nombre}}

Tu unidad: {{$('Lookup User').item.json.unidad}}
```

---

## 🧪 Testing Checklist

Before moving to next feature:
- [ ] Execute workflow manually
- [ ] Check all node outputs
- [ ] Verify data in Google Sheets
- [ ] Test in Telegram (send actual message)
- [ ] Check n8n Executions log (no errors)
- [ ] Save workflow
- [ ] Export backup JSON

---

## 🆘 Quick Help

**Can't find a node?**
- Search by name in "+" menu
- Common nodes: Telegram, Code, IF, Switch, Google Sheets

**Workflow not executing?**
- Toggle "Activate" (top right) ON
- Check Telegram Trigger credential selected
- Verify webhook is registered

**Want to test specific path?**
- Click "Execute node" on any node
- Use "Test step" button
- Check output in right panel

**Lost your place?**
- Check Executions tab for last run
- Review workflow with zoomed out view
- Follow the connecting lines

---

## 📌 Phase 2 Milestones

- [ ] Credentials added to n8n
- [ ] Base workflow created
- [ ] Main menu working
- [ ] Pause system complete (all 4 types)
- [ ] Incident system complete (all 6 types)
- [ ] Emergency button working
- [ ] Tested with 2-3 pilots
- [ ] Feedback collected

---

## 🔄 Backup Workflow

**After each milestone:**
```
1. Open workflow
2. Click "..." menu
3. Download
4. Save as: workflows/backups/phase-2-[milestone]-[date].json
```

---

**Last Updated:** 2025-12-01
**Phase:** 2 - Driver Bot Implementation
**Status:** Ready to Start
