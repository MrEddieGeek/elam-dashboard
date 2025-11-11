# 📍 ELAM Geocercas Synchronization Guide

Complete guide for importing and updating geocercas (geofences) from Wialon to Google Sheets.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [One-Time Import (Python)](#one-time-import-python)
4. [Ongoing Updates (n8n)](#ongoing-updates-n8n)
5. [Exporting KML from Wialon](#exporting-kml-from-wialon)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

We provide two methods for syncing geocercas:

### **Method 1: Python Script (One-Time Initial Import)**
- **When to use:** First time setup, importing all 311 geocercas
- **Pros:** Fast, runs locally, processes large files easily
- **Cons:** Requires Python setup, manual execution

### **Method 2: n8n Workflow (Ongoing Updates)**
- **When to use:** After initial import, when geocercas are added/updated in Wialon
- **Pros:** Automated, cloud-based, easy to trigger
- **Cons:** Requires KML file accessible via URL

**Recommended Flow:**
1. Use Python script for initial import (one time)
2. Use n8n workflow for future updates (whenever needed)

---

## 🔧 Initial Setup

### 1. Google Service Account Credentials

You need a Google Service Account with access to Google Sheets API.

**If you already have credentials:**
- Place your `service-account.json` file in: `credentials/service-account.json`
- Skip to step 2

**If you DON'T have credentials yet:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name it: `elam-sheets-service`
   - Click "Create and Continue"
   - Skip optional steps (no roles needed)
   - Click "Done"
5. Create credentials key:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON"
   - Download the file
6. Save the file:
   ```bash
   mkdir -p credentials
   mv ~/Downloads/your-project-*.json credentials/service-account.json
   ```
7. Share Google Sheet with Service Account:
   - Open your Google Sheet: https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit
   - Click "Share" button
   - Paste the service account email (from the JSON file, looks like: `elam-sheets-service@your-project.iam.gserviceaccount.com`)
   - Give "Editor" permissions
   - Uncheck "Notify people"
   - Click "Share"

### 2. Environment Variables

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
# Use your actual Google Sheet ID
GOOGLE_SHEET_ID=1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
VITE_GOOGLE_SHEET_ID=1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE
```

---

## 🐍 One-Time Import (Python)

### Step 1: Install Python Dependencies

```bash
# Make sure you have Python 3.8+ installed
python3 --version

# Install required packages
pip install -r requirements.txt
```

### Step 2: Verify Files

Ensure these files exist:

```bash
# KML file from Wialon
ls csv/Geofences\(1\).kml

# Service account credentials
ls credentials/service-account.json

# Environment variables
ls .env
```

### Step 3: Run Import Script

```bash
python3 scripts/import_geocercas.py
```

**Expected Output:**

```
============================================================
🚛 ELAM Geocercas Import Script
============================================================

📖 Reading KML file: /path/to/csv/Geofences(1).kml
✅ Parsed 311 geocercas from KML

📊 Summary:
   Total geocercas: 311
   Types:
      - caseta: 12
      - cliente: 45
      - otro: 89
      - puerto: 8
      - taller: 157

🔐 Authenticating with Google Sheets API...
✅ Sheet 'geocercas' already exists
📤 Writing 311 geocercas to Google Sheets...
✅ Successfully wrote 311 geocercas to Google Sheets!
📊 View at: https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit#gid=0

============================================================
✅ Import completed successfully!
============================================================
```

### Step 4: Verify in Google Sheets

1. Open your Google Sheet
2. Look for the `geocercas` tab
3. You should see 311 rows + header with columns:
   - `nombre`: Geofence name
   - `descripcion`: Address
   - `lat`: Center latitude
   - `lng`: Center longitude
   - `tipo`: Auto-detected type (taller/caseta/puerto/cliente/otro)
   - `poligono_coords`: Full polygon coordinates (JSON array)
   - `fecha_creacion`: Timestamp

---

## 🔄 Ongoing Updates (n8n)

### When to Use

Run this workflow when:
- ✅ You add new geocercas in Wialon
- ✅ You modify existing geocercas
- ✅ You delete geocercas
- ✅ You want to refresh all geocerca data

### Setup Steps

#### 1. Upload KML to Cloud Storage

**Option A: Google Drive (Recommended)**

1. Export fresh KML from Wialon (see [Exporting KML](#exporting-kml-from-wialon))
2. Upload to Google Drive
3. Right-click file > "Get link" > "Anyone with the link can view"
4. Copy the file ID from URL:
   ```
   https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view
                                    ↑ This is your file ID
   ```
5. Create direct download URL:
   ```
   https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
   ```

**Option B: Dropbox**

1. Upload KML to Dropbox
2. Create share link
3. Change `dl=0` to `dl=1` at the end

**Option C: Any HTTP server**

- Upload KML to any accessible HTTP/HTTPS URL

#### 2. Import Workflow to n8n

1. Go to n8n Cloud: https://app.n8n.cloud
2. Click "Workflows" > "Import from File"
3. Select: `n8n_workflows/ELAM_Sync_Geocercas_from_KML.json`
4. Click "Import"

#### 3. Configure n8n Environment Variables

1. In n8n, go to "Settings" > "Variables"
2. Add these environment variables:

   | Name | Value | Description |
   |------|-------|-------------|
   | `GOOGLE_SHEET_ID` | `1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE` | Your Google Sheet ID |
   | `KML_FILE_URL` | `https://drive.google.com/uc?export=download&id=YOUR_FILE_ID` | Direct download URL to KML |

#### 4. Configure Google Sheets Credential

1. In the workflow, click on any "Google Sheets" node
2. Click "Credential to connect with" > "Create New Credential"
3. Choose authentication method:
   - **Service Account** (recommended): Upload your `service-account.json`
   - **OAuth2**: Connect with your Google account
4. Test connection
5. Save credential

#### 5. Test Workflow

1. Click "Execute Workflow" button
2. Wait for execution (may take 30-60 seconds for 311 geocercas)
3. Check execution log:
   - ✅ "Obtener KML": Should show KML content
   - ✅ "Procesar KML": Should output 311 items
   - ✅ "Limpiar Geocercas": Clears existing data
   - ✅ "Actualizar Geocercas": Writes 311 rows

#### 6. Verify Results

1. Open Google Sheets
2. Go to `geocercas` tab
3. Data should be updated with fresh KML content
4. Check `fecha_creacion` timestamp to confirm

### Running Updates

**Every time you need to update:**

1. Export fresh KML from Wialon
2. Upload to same Google Drive location (replaces old file)
3. Go to n8n workflow
4. Click "Execute Workflow"
5. Wait for completion
6. Verify in Google Sheets

---

## 📤 Exporting KML from Wialon

### Step-by-Step

1. **Login to Wialon**
   - Go to: https://hst-api.wialon.com
   - Use your ae-track.com credentials

2. **Navigate to Geofences**
   - Click on "Geofences" icon (left sidebar)
   - Or go to: Monitoring > Geofences

3. **Select Geofences to Export**
   - **Option A:** Export all
     - Click checkbox at top to select all
   - **Option B:** Export specific ones
     - Hold Ctrl/Cmd and click individual geofences

4. **Export as KML**
   - Click "Tools" or "Actions" button
   - Select "Export"
   - Choose format: **KML**
   - Click "Export"

5. **Save File**
   - Browser will download: `Geofences.kml` or `Geofences(1).kml`
   - Keep the file for next steps

### KML File Structure

Your exported KML should contain:

```xml
<kml>
  <Document>
    <name>Geofences</name>
    <Placemark>
      <name>TALLER QUINTANAR TQPQ JAL</name>
      <description>Calle San Carlos 380A, Valle De La Misericordia...</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -103.349659,20.558088,0 -103.348906,20.558055,0 ...
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    <!-- More Placemarks... -->
  </Document>
</kml>
```

---

## 🔧 Troubleshooting

### Python Script Issues

#### Error: `No module named 'google'`

**Solution:**
```bash
pip install -r requirements.txt
```

#### Error: `.env file not found`

**Solution:**
```bash
cp .env.example .env
# Edit .env and add your GOOGLE_SHEET_ID
```

#### Error: `Credentials file not found`

**Solution:**
- Make sure `credentials/service-account.json` exists
- See [Initial Setup](#initial-setup) for getting credentials

#### Error: `Permission denied` when writing to Google Sheets

**Solution:**
1. Open Google Sheet
2. Click "Share"
3. Add service account email with "Editor" permissions
4. Service account email is in `credentials/service-account.json` → `client_email` field

#### Error: `No geocercas found in KML file`

**Solution:**
- Verify KML file path: `csv/Geofences(1).kml`
- Check KML file is not empty
- Ensure KML is valid XML format
- Try exporting fresh KML from Wialon

### n8n Workflow Issues

#### Error: `Environment variable KML_FILE_URL not found`

**Solution:**
1. Go to n8n Settings > Variables
2. Add `KML_FILE_URL` with your KML direct download URL

#### Error: `Failed to fetch KML file`

**Solution:**
- Test KML URL in browser - should auto-download file
- For Google Drive, ensure link is "Anyone with link can view"
- For Google Drive, use format: `https://drive.google.com/uc?export=download&id=FILE_ID`

#### Error: `DOMParser is not defined`

**Solution:**
- The JavaScript code uses browser APIs
- For n8n, we need to use a different XML parser
- Try this alternative "Procesar KML" code:

```javascript
// Alternative KML parser for n8n (without DOMParser)
const kmlContent = $input.first().json.data;

// Simple XML regex parsing
const placemarkRegex = /<Placemark>(.*?)<\/Placemark>/gs;
const nameRegex = /<name>(.*?)<\/name>/s;
const descRegex = /<description[^>]*>(.*?)<\/description>/s;
const coordsRegex = /<coordinates>(.*?)<\/coordinates>/s;

const geocercas = [];
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

let match;
while ((match = placemarkRegex.exec(kmlContent)) !== null) {
  const placemarkXml = match[1];

  try {
    // Extract name
    const nameMatch = nameRegex.exec(placemarkXml);
    const name = nameMatch ? nameMatch[1].trim() : 'Sin nombre';

    // Extract description
    const descMatch = descRegex.exec(placemarkXml);
    let description = '';
    if (descMatch) {
      const descText = descMatch[1].trim();
      if (descText.includes('img_data=')) {
        const parts = descText.split('>');
        description = parts.length > 1 ? parts[parts.length - 1].trim() : descText;
      } else {
        description = descText;
      }
    }

    // Extract coordinates
    const coordsMatch = coordsRegex.exec(placemarkXml);
    if (!coordsMatch) continue;

    const coordsText = coordsMatch[1].trim();
    const coordPairs = [];

    for (const coord of coordsText.split(/\s+/)) {
      const parts = coord.split(',');
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordPairs.push([lat, lng]);
        }
      }
    }

    if (coordPairs.length === 0) continue;

    // Calculate center
    const avgLat = coordPairs.reduce((s, p) => s + p[0], 0) / coordPairs.length;
    const avgLng = coordPairs.reduce((s, p) => s + p[1], 0) / coordPairs.length;

    // Detect type
    const nameUpper = name.toUpperCase();
    let tipo = 'otro';
    if (nameUpper.includes('TALLER')) tipo = 'taller';
    else if (nameUpper.includes('CASETA') || nameUpper.includes('PEAJE')) tipo = 'caseta';
    else if (nameUpper.includes('PUERTO') || nameUpper.includes('ADUANA')) tipo = 'puerto';
    else if (nameUpper.includes('CLIENTE') || nameUpper.includes('ALMACEN')) tipo = 'cliente';

    geocercas.push({
      nombre: name,
      descripcion: description,
      lat: Math.round(avgLat * 1000000) / 1000000,
      lng: Math.round(avgLng * 1000000) / 1000000,
      tipo: tipo,
      poligono_coords: JSON.stringify(coordPairs),
      fecha_creacion: now
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

return geocercas.map(g => ({ json: g }));
```

#### Workflow runs but no data in Google Sheets

**Solution:**
1. Check "Procesar KML" node output - should show 311 items
2. Verify Google Sheets credential is connected
3. Ensure `geocercas` sheet exists (run Python script first)
4. Check Google Sheets node is set to "Append" mode

---

## 📊 Google Sheets Structure

### Column Reference

| Column | Description | Example |
|--------|-------------|---------|
| `nombre` | Geocerca name from Wialon | `TALLER QUINTANAR TQPQ JAL` |
| `descripcion` | Full address | `Calle San Carlos 380A, Valle De La Misericordia, Tlaquepaque, Jalisco 45615, Mexico` |
| `lat` | Center latitude | `20.558088` |
| `lng` | Center longitude | `-103.349659` |
| `tipo` | Auto-detected type | `taller`, `caseta`, `puerto`, `cliente`, `otro` |
| `poligono_coords` | Full polygon coordinates (JSON) | `[[20.558088,-103.349659],[20.558055,-103.348906],...]` |
| `fecha_creacion` | Import timestamp | `2025-11-10 15:30:45` |

### Type Detection Logic

| Type | Keywords Detected |
|------|-------------------|
| `taller` | TALLER |
| `caseta` | CASETA, PEAJE |
| `puerto` | PUERTO, ADUANA |
| `cliente` | CLIENTE, ALMACEN, BODEGA |
| `otro` | Everything else |

---

## 🚀 Best Practices

### 1. **Backup Before Updates**

Before running updates, make a copy of the `geocercas` sheet:
1. Right-click on `geocercas` tab
2. Click "Duplicate"
3. Rename to `geocercas_backup_2025-11-10`

### 2. **Verify After Import**

After each import:
- ✅ Count rows: Should match number of geocercas in Wialon
- ✅ Check `fecha_creacion`: Should be recent timestamp
- ✅ Spot check 3-5 geocercas: Names and addresses correct
- ✅ Verify types: Talleres should be `taller`, etc.

### 3. **Update Schedule**

Recommended frequency:
- 📅 **Weekly**: If geocercas change frequently
- 📅 **Monthly**: For stable setups
- 📅 **On-demand**: When you add/modify geocercas

### 4. **Keep KML Files**

Save dated KML files for records:
```
csv/
  Geofences_2025-11-10.kml
  Geofences_2025-11-17.kml
  Geofences_2025-11-24.kml
```

---

## 📞 Support

### Issues or Questions?

1. **Check logs:**
   - Python: Terminal output
   - n8n: Execution log in workflow

2. **Verify setup:**
   - Run setup checklist above
   - Test credentials

3. **Common errors:**
   - See [Troubleshooting](#troubleshooting) section

4. **Need help?**
   - Review this guide
   - Check your execution logs
   - Document error messages

---

## 📝 Quick Reference

### Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run initial import
python3 scripts/import_geocercas.py

# Verify KML file
ls -lh csv/Geofences\(1\).kml

# Check credentials
ls credentials/service-account.json

# View environment
cat .env
```

### URLs

| Resource | URL |
|----------|-----|
| Google Sheet | https://docs.google.com/spreadsheets/d/1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE/edit |
| n8n Cloud | https://app.n8n.cloud |
| Wialon | https://hst-api.wialon.com |
| Google Cloud Console | https://console.cloud.google.com |

---

**Last Updated:** November 10, 2025
**Version:** 1.0
**Author:** ELAM Dashboard Team
