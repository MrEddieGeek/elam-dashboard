#!/usr/bin/env python3
"""
ELAM Geocercas Import Script
Import geocercas (geofences) from Wialon KML export to Google Sheets

Usage:
    python scripts/import_geocercas.py

Requirements:
    - KML file from Wialon at: csv/Geofences(1).kml
    - Google Service Account credentials: credentials/service-account.json
    - Environment variable GOOGLE_SHEET_ID set in .env file
"""

import os
import sys
import json
from datetime import datetime
from xml.etree import ElementTree as ET
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("❌ Error: Required packages not installed.")
    print("📦 Install with: pip install -r requirements.txt")
    sys.exit(1)

# Configuration
KML_FILE = "csv/Geofences(1).kml"
CREDENTIALS_FILE = "credentials/service-account.json"
SHEET_NAME = "geocercas"

# Google Sheets API setup
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


def load_env():
    """Load environment variables from .env file"""
    env_path = Path(__file__).parent.parent / ".env"
    if not env_path.exists():
        print("❌ Error: .env file not found")
        print(f"📝 Create .env file at: {env_path}")
        print("📝 Add: GOOGLE_SHEET_ID=your_sheet_id_here")
        sys.exit(1)

    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value.strip()


def get_credentials():
    """Get Google Sheets API credentials"""
    creds_path = Path(__file__).parent.parent / CREDENTIALS_FILE

    if not creds_path.exists():
        print(f"❌ Error: Credentials file not found at {creds_path}")
        print("\n📝 To get your credentials:")
        print("1. Go to Google Cloud Console: https://console.cloud.google.com")
        print("2. Create/select a project")
        print("3. Enable Google Sheets API")
        print("4. Create Service Account")
        print("5. Download credentials JSON")
        print(f"6. Save as: {CREDENTIALS_FILE}")
        sys.exit(1)

    return service_account.Credentials.from_service_account_file(
        str(creds_path), scopes=SCOPES
    )


def parse_kml(kml_path):
    """Parse KML file and extract geofence data"""
    kml_file = Path(__file__).parent.parent / kml_path

    if not kml_file.exists():
        print(f"❌ Error: KML file not found at {kml_file}")
        print("\n📝 To export KML from Wialon:")
        print("1. Go to Wialon web interface")
        print("2. Navigate to Geofences section")
        print("3. Select all geofences")
        print("4. Export as KML")
        print(f"5. Save as: {KML_FILE}")
        sys.exit(1)

    print(f"📖 Reading KML file: {kml_file}")
    tree = ET.parse(kml_file)
    root = tree.getroot()

    geocercas = []

    # Find all Placemark elements (each is a geofence)
    for placemark in root.iter('Placemark'):
        try:
            # Extract name
            name_elem = placemark.find('name')
            name = name_elem.text.strip() if name_elem is not None and name_elem.text else "Sin nombre"

            # Extract description (address)
            desc_elem = placemark.find('description')
            description = ""
            if desc_elem is not None and desc_elem.text:
                # Remove image data if present
                desc_text = desc_elem.text.strip()
                if 'img_data=' in desc_text:
                    # Extract only the address part
                    parts = desc_text.split('>')
                    if len(parts) > 1:
                        description = parts[-1].strip()
                    else:
                        description = desc_text
                else:
                    description = desc_text

            # Extract polygon coordinates
            polygon = placemark.find('.//Polygon//coordinates')
            if polygon is None or not polygon.text:
                print(f"⚠️  Warning: No coordinates found for {name}, skipping...")
                continue

            # Parse coordinates (format: lng,lat,alt lng,lat,alt ...)
            coords_text = polygon.text.strip()
            coord_pairs = []
            for coord in coords_text.split():
                parts = coord.split(',')
                if len(parts) >= 2:
                    try:
                        lng = float(parts[0])
                        lat = float(parts[1])
                        coord_pairs.append((lat, lng))
                    except ValueError:
                        continue

            if not coord_pairs:
                print(f"⚠️  Warning: No valid coordinates for {name}, skipping...")
                continue

            # Calculate center point (average of all coordinates)
            avg_lat = sum(lat for lat, lng in coord_pairs) / len(coord_pairs)
            avg_lng = sum(lng for lat, lng in coord_pairs) / len(coord_pairs)

            # Format polygon coordinates as JSON string
            polygon_json = json.dumps(coord_pairs)

            # Auto-detect type based on name
            tipo = detect_type(name)

            # Create geocerca entry
            geocerca = {
                'nombre': name,
                'descripcion': description,
                'lat': round(avg_lat, 6),
                'lng': round(avg_lng, 6),
                'tipo': tipo,
                'poligono_coords': polygon_json,
                'fecha_creacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            geocercas.append(geocerca)

        except Exception as e:
            print(f"⚠️  Error parsing placemark: {e}")
            continue

    print(f"✅ Parsed {len(geocercas)} geocercas from KML")
    return geocercas


def detect_type(name):
    """Auto-detect geofence type based on name"""
    name_upper = name.upper()

    if 'TALLER' in name_upper:
        return 'taller'
    elif 'CASETA' in name_upper or 'PEAJE' in name_upper:
        return 'caseta'
    elif 'PUERTO' in name_upper or 'ADUANA' in name_upper:
        return 'puerto'
    elif 'CLIENTE' in name_upper or 'ALMACEN' in name_upper or 'BODEGA' in name_upper:
        return 'cliente'
    else:
        return 'otro'


def create_sheet_if_not_exists(service, spreadsheet_id):
    """Create geocercas sheet if it doesn't exist"""
    try:
        # Get existing sheets
        spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = spreadsheet.get('sheets', [])

        # Check if geocercas sheet exists
        sheet_exists = any(sheet['properties']['title'] == SHEET_NAME for sheet in sheets)

        if not sheet_exists:
            print(f"📝 Creating new sheet: {SHEET_NAME}")
            request = {
                'addSheet': {
                    'properties': {
                        'title': SHEET_NAME,
                        'gridProperties': {
                            'rowCount': 1000,
                            'columnCount': 7
                        }
                    }
                }
            }
            service.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={'requests': [request]}
            ).execute()
            print(f"✅ Sheet '{SHEET_NAME}' created")
        else:
            print(f"✅ Sheet '{SHEET_NAME}' already exists")

    except HttpError as error:
        print(f"❌ Error checking/creating sheet: {error}")
        sys.exit(1)


def write_to_sheets(geocercas):
    """Write geocercas data to Google Sheets"""
    load_env()

    sheet_id = os.getenv('GOOGLE_SHEET_ID')
    if not sheet_id:
        print("❌ Error: GOOGLE_SHEET_ID not set in .env file")
        sys.exit(1)

    print(f"🔐 Authenticating with Google Sheets API...")
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)

    # Create sheet if needed
    create_sheet_if_not_exists(service, sheet_id)

    # Prepare data for writing
    headers = ['nombre', 'descripcion', 'lat', 'lng', 'tipo', 'poligono_coords', 'fecha_creacion']
    rows = [headers]

    for geocerca in geocercas:
        row = [
            geocerca['nombre'],
            geocerca['descripcion'],
            geocerca['lat'],
            geocerca['lng'],
            geocerca['tipo'],
            geocerca['poligono_coords'],
            geocerca['fecha_creacion']
        ]
        rows.append(row)

    # Clear existing data and write new data
    print(f"📤 Writing {len(geocercas)} geocercas to Google Sheets...")

    try:
        # Clear existing data
        service.spreadsheets().values().clear(
            spreadsheetId=sheet_id,
            range=f"{SHEET_NAME}!A:G"
        ).execute()

        # Write new data
        service.spreadsheets().values().update(
            spreadsheetId=sheet_id,
            range=f"{SHEET_NAME}!A1",
            valueInputOption='RAW',
            body={'values': rows}
        ).execute()

        print(f"✅ Successfully wrote {len(geocercas)} geocercas to Google Sheets!")
        print(f"📊 View at: https://docs.google.com/spreadsheets/d/{sheet_id}/edit#gid=0")

    except HttpError as error:
        print(f"❌ Error writing to Google Sheets: {error}")
        sys.exit(1)


def main():
    """Main execution function"""
    print("=" * 60)
    print("🚛 ELAM Geocercas Import Script")
    print("=" * 60)
    print()

    # Parse KML
    geocercas = parse_kml(KML_FILE)

    if not geocercas:
        print("❌ No geocercas found in KML file")
        sys.exit(1)

    # Show summary
    print()
    print("📊 Summary:")
    print(f"   Total geocercas: {len(geocercas)}")

    # Count by type
    tipos = {}
    for g in geocercas:
        tipo = g['tipo']
        tipos[tipo] = tipos.get(tipo, 0) + 1

    print("   Types:")
    for tipo, count in sorted(tipos.items()):
        print(f"      - {tipo}: {count}")

    print()

    # Write to Google Sheets
    write_to_sheets(geocercas)

    print()
    print("=" * 60)
    print("✅ Import completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
