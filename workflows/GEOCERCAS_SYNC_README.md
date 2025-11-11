# Geocercas Automatic Sync - Setup Guide

## Overview

This n8n workflow automatically synchronizes geofences (geocercas) from Wialon GPS to your Google Sheets database every 6 hours. When you add, modify, or delete a geofence in Wialon, it will automatically appear in your Google Sheet.

## What This Workflow Does

1. **Authenticates** to Wialon API using stored credentials
2. **Fetches** all resources (accounts) from your Wialon system
3. **Retrieves** all geofences from each resource
4. **Transforms** Wialon geofence data to match your Google Sheets format
5. **Clears** the existing geocercas sheet (keeping the header row)
6. **Writes** all current geofences to Google Sheets
7. **Logs out** from Wialon properly

## Workflow Features

- ✅ **Automatic Type Detection**: Identifies geofence types (taller, puerto, caseta, cliente) based on names
- ✅ **Smart Status Mapping**: Assigns appropriate statuses and activities based on geofence type
- ✅ **Coordinate Extraction**: Handles circles, polygons, and complex shapes
- ✅ **Address Resolution**: Includes location addresses when available
- ✅ **Full Sync**: Replaces all data to ensure consistency
- ✅ **Scheduled Execution**: Runs every 6 hours automatically

## Setup Instructions

### Step 1: Import the Workflow

1. Login to your n8n Cloud instance at https://app.n8n.cloud
2. Click **Workflows** in the left sidebar
3. Click **Add workflow** → **Import from file**
4. Select `sync_geocercas_workflow.json`
5. Click **Import**

### Step 2: Configure Wialon Credentials

**IMPORTANT**: Do NOT hardcode your token in the workflow!

1. Go to **Credentials** in n8n
2. Click **Add Credential**
3. Search for "HTTP Request Auth" or create a custom credential type
4. Configure as follows:
   - **Name**: `Wialon GPS API - ELAM`
   - **Authentication**: `Header Auth` or `Generic`
   - **Token/API Key**: Your Wialon API token

5. Save the credential

6. In the workflow, update these nodes to use your credential:
   - **Login Wialon** node
   - Click on the node
   - Under "Authentication", select your Wialon credential
   - Save

### Step 3: Configure Google Sheets Credentials

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for **Google Sheets OAuth2**
4. Follow the OAuth setup wizard:
   - Login with your Google account
   - Grant permissions to n8n
   - Test the connection

5. In the workflow, update these nodes:
   - **Limpiar Hoja Geocercas** (Clear Sheet)
   - **Actualizar Google Sheets** (Update Sheet)
   - Select your Google Sheets OAuth2 credential

### Step 4: Verify Sheet Configuration

1. Open your Google Sheet
2. Ensure you have a sheet named **`geocercas`** (exact name, lowercase)
3. The first row should have these headers:
   ```
   nombre | tipo | ubicacion | lat | lng | status_entrada | status_salida | actividad_entrada | actividad_salida | prioridad_alerta | notas
   ```

4. If the sheet doesn't exist:
   - Create a new sheet
   - Name it `geocercas`
   - Copy headers from `templates/template_geocercas_completo.csv`

### Step 5: Test the Workflow

1. In the n8n workflow editor, click **Execute Workflow** (play button)
2. Watch the execution:
   - Login Wialon ✅ (should show session ID)
   - Buscar Recursos ✅ (should show list of resources)
   - Split Recursos ✅ (processes each resource)
   - Obtener Geocercas ✅ (fetches geofences)
   - Transformar Datos ✅ (converts format)
   - Actualizar Google Sheets ✅ (writes to sheet)
   - Logout Wialon ✅

3. Check your Google Sheet:
   - Open the `geocercas` sheet
   - You should see all geofences from Wialon
   - Verify coordinates, types, and statuses

### Step 6: Activate the Workflow

1. Toggle the **Active** switch in the top-right corner
2. The workflow will now run automatically every 6 hours

## Customization Options

### Change Sync Frequency

1. Click on the **Cada 6 horas** (Schedule Trigger) node
2. Change the interval:
   - Every 3 hours: Better for real-time updates
   - Every 12 hours: Reduces API calls
   - Every 24 hours: Minimal updates
3. Save the workflow

### Modify Type Detection Rules

Edit the **Transformar Datos de Geocercas** (Code node):

```javascript
// Add your own type detection rules
if (nombreLower.includes('tu_palabra_clave')) {
  tipo = 'tu_tipo_personalizado';
}
```

### Adjust Status Mappings

In the same Code node, modify the `switch(tipo)` block:

```javascript
case 'tu_tipo_personalizado':
  status_entrada = 'Tu Status';
  status_salida = 'Tu Otro Status';
  actividad_entrada = 'Tu Actividad';
  actividad_salida = 'Tu Otra Actividad';
  prioridad_alerta = 'alta'; // alta, media, baja
  break;
```

## Geofence Type Detection Logic

The workflow automatically categorizes geofences based on name patterns:

| Pattern in Name | Assigned Type | Example |
|----------------|---------------|---------|
| "taller", "faw", "elam" | `taller` | ELAM FAW STEP JAL |
| "caseta", "peaje" | `caseta` | CASETA FELICIANO |
| "puerto" | `puerto` | PUERTO MANZANILLO |
| "cliente", "entrega" | `cliente` | CASA LIDER |
| (other) | `otro` | Custom location |

## Status & Activity Mappings

| Geofence Type | Status Entrada | Status Salida | Actividad Entrada | Actividad Salida |
|--------------|----------------|---------------|-------------------|------------------|
| `taller` | En Taller | Disponible | Mantenimiento | Esperando asignación |
| `puerto` | En Puerto | En Ruta | Carga/Descarga | Tránsito |
| `caseta` | En Ruta | En Ruta | Tránsito autopista | Tránsito |
| `cliente` | Descargando | En Ruta | Entrega en curso | Tránsito |
| `otro` | En Ruta | En Ruta | Tránsito | Tránsito |

## Troubleshooting

### Issue: "Authentication failed"

**Solution**:
- Verify your Wialon token is correct
- Check token hasn't expired
- Ensure credential is properly linked in workflow nodes

### Issue: "Sheet not found"

**Solution**:
- Verify sheet name is exactly `geocercas` (lowercase)
- Check Google Sheet ID matches your configuration
- Ensure Google Sheets credential has access to the sheet

### Issue: "No geofences fetched"

**Solution**:
- Verify you have geofences created in Wialon
- Check if geofences are in the correct resource
- Review Wialon API permissions for your token

### Issue: "Coordinates are null"

**Solution**:
- Some Wialon geofences may not have center points
- The workflow tries to calculate centroid for polygons
- Check if geofence is properly defined in Wialon

### Issue: "Duplicate entries"

**Solution**:
- The workflow clears the sheet before writing
- If you see duplicates, check if multiple resources have the same geofences
- Add deduplication logic in the Code node if needed

## Advanced: Adding Deduplication

If you have geofences with the same name in multiple resources, add this to the Code node:

```javascript
// After the for loop, before return items:
const uniqueItems = [];
const seenNames = new Set();

for (const item of items) {
  if (!seenNames.has(item.json.nombre)) {
    seenNames.add(item.json.nombre);
    uniqueItems.push(item);
  }
}

return uniqueItems;
```

## Monitoring & Alerts

### Set Up Execution Alerts

1. In n8n, go to **Workflow Settings**
2. Enable **Error Workflow**
3. Select or create an error notification workflow
4. Options:
   - Send email on failure
   - Post to Slack/Discord
   - Log to monitoring system

### View Execution History

1. Open the workflow
2. Click **Executions** tab
3. Review past runs:
   - Success/failure status
   - Execution time
   - Number of geofences synced
   - Error messages

## Manual Sync

To sync geofences on-demand:

1. Open the workflow in n8n
2. Click **Execute Workflow** button
3. Wait for completion (~30-60 seconds)
4. Check Google Sheet for updated data

## Integration with Main Dashboard

The geocercas sheet is now automatically updated, so your main workflow can reference it:

```javascript
// In your status update workflow
// Check if unit is inside a geofence
const geocercas = await fetchGoogleSheet('geocercas');
const currentGeofence = geocercas.find(g =>
  isPointInCircle(unitLat, unitLng, g.lat, g.lng, radius)
);

if (currentGeofence) {
  status = currentGeofence.status_entrada;
  actividad = currentGeofence.actividad_entrada;
}
```

## Performance Considerations

- **API Calls**: Each sync makes ~3-5 API calls to Wialon
- **Execution Time**: ~30-60 seconds for 100 geofences
- **Sheet Size**: Can handle 1000+ geofences easily
- **Frequency**: 6 hours is optimal (4 syncs/day)

## Security Best Practices

✅ **Do**: Store credentials in n8n Credentials
✅ **Do**: Use OAuth2 for Google Sheets
✅ **Do**: Review workflow exports before committing
❌ **Don't**: Hardcode tokens in workflow JSON
❌ **Don't**: Share workflow exports with credentials
❌ **Don't**: Make sheet publicly writable

## Support

If you encounter issues:

1. Check the **Executions** tab for error details
2. Review Wialon API documentation: https://sdk.wialon.com/wiki/en/sidebar/remoteapi/apiref/apiref
3. Check n8n community forum: https://community.n8n.io
4. Refer to the main project documentation

---

**Workflow Version**: 1.0.0
**Last Updated**: 2025-11-10
**Compatibility**: n8n Cloud & Self-Hosted (v1.0+)
