# Geocercas Sync - Quick Setup (Using Your Existing n8n Variables)

Since you already have n8n environment variables configured, setup is simple!

## Required n8n Environment Variables

Make sure these are set in your n8n instance:

```bash
WIALON_TOKEN=your_wialon_token_here
GOOGLE_SHEET_ID=1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
```

## Import & Setup Steps

### 1. Import the Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select `sync_geocercas_workflow.json`
4. Click **Import**

### 2. Update Google Sheets Credential Reference

The workflow needs your existing Google Sheets credential:

1. Open the workflow
2. Click on **"Limpiar Hoja Geocercas"** node
3. In the Credential dropdown, select your existing Google Sheets credential
4. Click on **"Actualizar Google Sheets"** node
5. Select the same Google Sheets credential
6. Save the workflow

### 3. Verify Sheet Structure

Make sure your Google Sheet has a sheet named `geocercas` with these columns:

```
nombre | tipo | ubicacion | lat | lng | status_entrada | status_salida | actividad_entrada | actividad_salida | prioridad_alerta | notas
```

If you don't have it, copy the structure from `templates/template_geocercas_completo.csv`

### 4. Test the Workflow

1. Click **"Execute Workflow"** button
2. Watch it run through all nodes
3. Check your Google Sheet - should see all geocercas from Wialon!

### 5. Activate

1. Toggle **"Active"** switch in top-right
2. Done! Syncs every 6 hours automatically

## How It Works

```
Every 6 hours → Login to Wialon (using $env.WIALON_TOKEN)
  → Fetch all resources
  → Get geofences from each resource
  → Auto-detect type (taller/puerto/caseta/cliente)
  → Clear geocercas sheet
  → Write all geofences to Google Sheets (using $env.GOOGLE_SHEET_ID)
  → Logout
```

## What Gets Auto-Detected

| Geofence Name Contains | Type Assigned | Status Entrada | Actividad |
|------------------------|---------------|----------------|-----------|
| "taller", "faw", "elam" | `taller` | En Taller | Mantenimiento |
| "caseta", "peaje" | `caseta` | En Ruta | Tránsito autopista |
| "puerto" | `puerto` | En Puerto | Carga/Descarga |
| "cliente", "entrega" | `cliente` | Descargando | Entrega en curso |

## Testing

Add a test geofence in Wialon:
- Name: "TEST ELAM TALLER"
- Set coordinates
- Save

Run the workflow → Check Google Sheet → Should appear as `tipo: taller`

## Troubleshooting

**Workflow fails at Login?**
- Check `WIALON_TOKEN` is set in n8n environment variables

**Workflow fails at Google Sheets?**
- Verify credential is selected in both Google Sheets nodes
- Check `GOOGLE_SHEET_ID` environment variable
- Ensure `geocercas` sheet exists with correct headers

**No geofences appearing?**
- Check Wialon has geofences created
- Review n8n execution log for errors
- Verify sheet name is exactly `geocercas` (lowercase)

## Customization

### Change sync frequency
Edit **"Cada 6 horas"** node → Change interval (3h, 12h, 24h)

### Add custom type detection
Edit **"Transformar Datos de Geocercas"** node → Add your rules in the JavaScript code

### Different sheet name
Edit both Google Sheets nodes → Change `sheetName` value

---

That's it! Your geocercas will now sync automatically from Wialon. 🚀
