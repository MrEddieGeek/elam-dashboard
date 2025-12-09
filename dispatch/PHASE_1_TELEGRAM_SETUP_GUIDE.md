# Phase 1: Telegram Bot Setup - Quick Guide

## Step 1: Create Driver Bot

1. Open Telegram on your phone or desktop
2. Search for `@BotFather`
3. Send: `/newbot`
4. When asked for name, send: `ELAM Fleet Conductores`
5. When asked for username, send: `ELAMFleetConductores_bot`
6. **IMPORTANT:** Copy the token that BotFather gives you
   - Format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567`
   - Save it here: `REDACTED_REVOKED_DRIVER_BOT_TOKEN`

7. Configure commands - Send to BotFather: `/setcommands`
8. Select your bot: `@ELAMFleetConductores_bot`
9. Copy and paste this exact text:

```
start - Iniciar bot y ver menú principal
pausa - Registrar pausa rápida
trafico - Reportar tráfico pesado
llegue - Marcar llegada a destino
ubicacion - Compartir ubicación actual
ayuda - Ver ayuda y comandos
```

10. BotFather will confirm: "Success! Command list updated."

---

## Step 2: Create Dispatcher Bot

1. Still in chat with `@BotFather`
2. Send: `/newbot`
3. When asked for name, send: `ELAM Fleet Despacho`
4. When asked for username, send: `ELAMFleetDespacho_bot`
5. **IMPORTANT:** Copy the token
   - Save it here: `REDACTED_REVOKED_DISPATCHER_BOT_TOKEN`

6. Configure commands - Send: `/setcommands`
7. Select: `@ELAMFleetDespacho_bot`
8. Copy and paste:

```
status - Resumen general de la flota
enruta - Ver unidades en movimiento
alertas - Ver alertas activas
pausas - Ver pausas en curso
buscar - Buscar unidad
ayuda - Ayuda del sistema
```

---

## Step 3: Create Dispatcher Group

1. In Telegram, create a new group
2. Name it: `ELAM Fleet - Despacho`
3. Add all your dispatchers as members
4. Add `@ELAMFleetDespacho_bot` to the group
5. Make the bot an administrator:
   - Group settings → Administrators → Add Administrator
   - Select `@ELAMFleetDespacho_bot`
   - Give it permission to "Send Messages"

---

## Step 4: Get Group Chat ID

**Method 1: Using getUpdates (Easiest)**

1. Send any message to the group (e.g., "test")
2. Open this URL in your browser (replace TOKEN with your dispatcher bot token):
   ```
   https://api.telegram.org/bot[YOUR_DISPATCHER_BOT_TOKEN]/getUpdates
   ```
3. Look for `"chat":{"id":-1001234567890`
4. The Chat ID is the negative number (e.g., `-1001234567890`)
5. Save it here: `-5041344298`

**Method 2: Using @userinfobot**

1. Add `@userinfobot` to your dispatcher group
2. It will immediately tell you the Chat ID
3. Remove `@userinfobot` after getting the ID

---

## Step 5: Test Your Bots

**Test Driver Bot:**
1. Search for `@ELAMFleetConductores_bot` in Telegram
2. Send: `/start`
3. You should get a response (might just say "Hello")
4. Send: `/help`
5. You should see the commands menu

**Test Dispatcher Bot:**
1. Search for `@ELAMFleetDespacho_bot`
2. Send: `/start`
3. Should get a response
4. Test in the group: Send `/status` in the ELAM Fleet - Despacho group
5. Bot should respond (or show it's "thinking")

---

## Tokens Summary (Fill these in)

**Driver Bot Token:**
```
REDACTED_REVOKED_DRIVER_BOT_TOKEN
```

**Dispatcher Bot Token:**
```
REDACTED_REVOKED_DISPATCHER_BOT_TOKEN
```

**Dispatcher Group Chat ID:**
```
-5041344298
```

---

## Next Steps

Once you have all three values above:
1. Go to your n8n instance
2. Settings → Credentials
3. Add credentials for both bots (I'll help you with this)
4. Add Chat ID as environment variable

**✅ Checklist:**
- [X] Driver bot created
- [X] Driver bot commands configured
- [X] Dispatcher bot created
- [X] Dispatcher bot commands configured
- [X] Dispatcher group created
- [X] Bot added to group as admin
- [x] Group Chat ID obtained
- [X] All tokens saved

---

**Time to complete:** ~15 minutes
**Ready for:** n8n credential setup
