#!/usr/bin/env python3
"""
Test KML parsing logic without Google Sheets
Quick validation that KML file can be parsed correctly
"""

import json
from datetime import datetime
from xml.etree import ElementTree as ET
from pathlib import Path

KML_FILE = "csv/Geofences(1).kml"


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


def parse_kml(kml_path):
    """Parse KML file and extract geofence data"""
    kml_file = Path(__file__).parent.parent / kml_path

    if not kml_file.exists():
        print(f"❌ Error: KML file not found at {kml_file}")
        return []

    print(f"📖 Reading KML file: {kml_file}")
    print(f"📏 File size: {kml_file.stat().st_size / 1024:.1f} KB")
    print()

    tree = ET.parse(kml_file)
    root = tree.getroot()

    geocercas = []

    # Find all Placemark elements
    for placemark in root.iter('Placemark'):
        try:
            # Extract name
            name_elem = placemark.find('name')
            name = name_elem.text.strip() if name_elem is not None and name_elem.text else "Sin nombre"

            # Extract description
            desc_elem = placemark.find('description')
            description = ""
            if desc_elem is not None and desc_elem.text:
                desc_text = desc_elem.text.strip()
                if 'img_data=' in desc_text:
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
                continue

            # Parse coordinates
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
                continue

            # Calculate center point
            avg_lat = sum(lat for lat, lng in coord_pairs) / len(coord_pairs)
            avg_lng = sum(lng for lat, lng in coord_pairs) / len(coord_pairs)

            # Format polygon coordinates as JSON string
            polygon_json = json.dumps(coord_pairs)

            # Auto-detect type
            tipo = detect_type(name)

            # Create geocerca entry
            geocerca = {
                'nombre': name,
                'descripcion': description,
                'lat': round(avg_lat, 6),
                'lng': round(avg_lng, 6),
                'tipo': tipo,
                'poligono_coords': polygon_json,
                'num_coords': len(coord_pairs),
                'fecha_creacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }

            geocercas.append(geocerca)

        except Exception as e:
            print(f"⚠️  Error parsing placemark: {e}")
            continue

    return geocercas


def main():
    """Main test function"""
    print("=" * 70)
    print("🧪 KML Parsing Test")
    print("=" * 70)
    print()

    # Parse KML
    geocercas = parse_kml(KML_FILE)

    if not geocercas:
        print("❌ No geocercas found in KML file")
        return

    print(f"✅ Parsed {len(geocercas)} geocercas")
    print()

    # Count by type
    tipos = {}
    for g in geocercas:
        tipo = g['tipo']
        tipos[tipo] = tipos.get(tipo, 0) + 1

    print("📊 Summary by Type:")
    for tipo, count in sorted(tipos.items()):
        print(f"   {tipo:10} : {count:3} geocercas")
    print()

    # Show sample geocercas (first 5)
    print("📍 Sample Geocercas (first 5):")
    print()
    for i, g in enumerate(geocercas[:5], 1):
        print(f"{i}. {g['nombre']}")
        print(f"   Tipo: {g['tipo']}")
        print(f"   Ubicación: {g['lat']:.6f}, {g['lng']:.6f}")
        print(f"   Coordenadas: {g['num_coords']} puntos")
        if g['descripcion']:
            desc_short = g['descripcion'][:60] + "..." if len(g['descripcion']) > 60 else g['descripcion']
            print(f"   Dirección: {desc_short}")
        print()

    # Validation checks
    print("🔍 Validation:")
    print(f"   ✓ All geocercas have names: {all(g['nombre'] for g in geocercas)}")
    print(f"   ✓ All geocercas have coordinates: {all(g['num_coords'] > 0 for g in geocercas)}")
    print(f"   ✓ All geocercas have types: {all(g['tipo'] for g in geocercas)}")
    print(f"   ✓ All geocercas have valid lat/lng: {all(-90 <= g['lat'] <= 90 and -180 <= g['lng'] <= 180 for g in geocercas)}")
    print()

    print("=" * 70)
    print("✅ KML parsing successful!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Install Python dependencies: pip install -r requirements.txt")
    print("2. Set up Google Sheets credentials (see GEOCERCAS_SYNC_GUIDE.md)")
    print("3. Run full import: python3 scripts/import_geocercas.py")


if __name__ == "__main__":
    main()
