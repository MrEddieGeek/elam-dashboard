# Puerto Notifications Setup & Testing Checklist

**ELAM Logistics - Wialon Configuration**

Use this checklist to track your progress when configuring puerto geofence notifications in Wialon.

---

## 📋 Pre-Setup Verification

- [ ] Wialon admin access confirmed
- [ ] All 8 puerto geofences exist in Wialon
- [ ] Geofence names match Google Sheets `geocercas` sheet (case-sensitive)
- [ ] n8n webhook URL copied: `https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon`
- [ ] n8n workflow "Telegram Listener v2 COMPLETE" is active
- [ ] Google Sheets has puerto geofences with `tipo = "puerto"`
- [ ] CSV template reviewed: `templates/wialon_puerto_notifications.csv`

---

## 🔧 Notification Configuration

### Entry Notifications (8 total)

- [ ] **Entrada_ASLA_LZC**
  - Geofence: ASLA LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_ADUANA_LZC**
  - Geofence: ADUANA LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_AUDITORIA_LZC**
  - Geofence: AUDITORIA LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_APM_TERMINALS_LZC**
  - Geofence: APM TERMINALS LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_HUTCHISON_PORT_LZC**
  - Geofence: HUTCHISON PORT LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_MKS_LZC**
  - Geofence: MKS LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_BLVD_AEROPUERTO_MIGUEL_ALEMAN**
  - Geofence: BLVD. AEROPUERTO MIGUEL ALEMÁN
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Entrada_COMPLEJO_PORTUARIO_LZC**
  - Geofence: COMPLEJO PORTUARIO LZC
  - Control type: Inside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

### Exit Notifications (8 total)

- [ ] **Salida_ASLA_LZC**
  - Geofence: ASLA LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_ADUANA_LZC**
  - Geofence: ADUANA LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_AUDITORIA_LZC**
  - Geofence: AUDITORIA LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_APM_TERMINALS_LZC**
  - Geofence: APM TERMINALS LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_HUTCHISON_PORT_LZC**
  - Geofence: HUTCHISON PORT LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_MKS_LZC**
  - Geofence: MKS LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_BLVD_AEROPUERTO_MIGUEL_ALEMAN**
  - Geofence: BLVD. AEROPUERTO MIGUEL ALEMÁN
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

- [ ] **Salida_COMPLEJO_PORTUARIO_LZC**
  - Geofence: COMPLEJO PORTUARIO LZC
  - Control type: Outside geofence
  - Action: Send POST request
  - Webhook URL configured
  - Active: ✅

---

## 🧪 Testing - Entry Events

Test each puerto entry notification:

- [ ] **ASLA LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **ADUANA LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **AUDITORIA LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **APM TERMINALS LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **HUTCHISON PORT LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **MKS LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **BLVD. AEROPUERTO MIGUEL ALEMÁN Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **COMPLEJO PORTUARIO LZC Entry**
  - Unit entered geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

---

## 🧪 Testing - Exit Events

Test each puerto exit notification:

- [ ] **ASLA LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **ADUANA LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **AUDITORIA LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **APM TERMINALS LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **HUTCHISON PORT LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **MKS LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **BLVD. AEROPUERTO MIGUEL ALEMÁN Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

- [ ] **COMPLEJO PORTUARIO LZC Exit**
  - Unit exited geofence: _________________
  - Wialon notification fired: ✅ / ❌
  - n8n execution succeeded: ✅ / ❌
  - Google Sheets updated: ✅ / ❌
  - Dashboard displays correctly: ✅ / ❌

---

## 📊 System Verification

### Wialon

- [ ] All 16 notifications visible in notifications list
- [ ] All notifications show "Active" status
- [ ] Notification execution log shows recent activity
- [ ] No errors in execution log

### n8n Cloud

- [ ] Workflow "Telegram Listener v2 COMPLETE" is active (green toggle)
- [ ] Recent executions show in execution history
- [ ] All executions successful (green checkmarks)
- [ ] No failed executions (red X's)

### Google Sheets

- [ ] `status_operativo` sheet updates in real-time
- [ ] `eventos_log` sheet captures all puerto events
- [ ] All puerto geofences in `geocercas` sheet have:
  - `tipo = "puerto"`
  - `status_entrada` populated
  - `status_salida` populated
  - `actividad_entrada` populated
  - `actividad_salida` populated

### ELAM Dashboard

- [ ] Dashboard accessible: https://elam-dashboard.onrender.com
- [ ] Auto-refresh working (every 2 minutes)
- [ ] Puerto events display correctly
- [ ] Status badges show correct colors
- [ ] Location shows puerto name
- [ ] Operador column populated (if assigned)
- [ ] Próximo Movimiento column calculated

---

## 🐛 Troubleshooting Log

If you encounter issues, document them here:

### Issue 1
- **Date/Time**: _________________
- **Puerto**: _________________
- **Problem**: _________________
- **Solution**: _________________

### Issue 2
- **Date/Time**: _________________
- **Puerto**: _________________
- **Problem**: _________________
- **Solution**: _________________

### Issue 3
- **Date/Time**: _________________
- **Puerto**: _________________
- **Problem**: _________________
- **Solution**: _________________

---

## ✅ Final Sign-Off

**Configuration completed by**: _________________
**Date completed**: _________________
**Total notifications configured**: ____ / 16
**Total notifications tested**: ____ / 16
**Success rate**: _____%

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Status**: ☐ In Progress  ☐ Testing  ☐ Production Ready ✅

---

## 📚 Quick Reference

**Key URLs:**
- Wialon: https://hst-api.wialon.com
- n8n: https://elam-logistic.app.n8n.cloud
- Google Sheets: https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit
- Dashboard: https://elam-dashboard.onrender.com

**Webhook URL:**
```
https://elam-logistic.app.n8n.cloud/webhook/telegram-wialon
```

**JSON Payload Template:**
```json
{
  "unidad": "%UNIT%",
  "evento": "entrada_puerto" or "salida_puerto",
  "geocerca": "%ZONE%",
  "hora": "%POS_TIME%",
  "velocidad": "%SPEED%",
  "ubicacion": "%LOCATION%"
}
```

---

**Document Version:** 1.0
**Last Updated:** November 11, 2025
**Printable**: ✅ Yes (5 pages)
