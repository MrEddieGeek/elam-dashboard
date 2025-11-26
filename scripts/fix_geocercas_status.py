#!/usr/bin/env python3
"""
Script to fix geocercas sheet by adding missing status columns
and correcting pension/taller geofence configurations
"""

import pandas as pd
import sys
from pathlib import Path

# File paths
INPUT_FILE = '/home/mreddie/Documents/Recursiones/ELAM/elam-dashboard/csv/ELAM_Fleet_Data(2).xlsx'
OUTPUT_FILE = '/home/mreddie/Documents/Recursiones/ELAM/elam-dashboard/csv/ELAM_Fleet_Data_FIXED.xlsx'

def fix_geocercas():
    print("🔧 Loading geocercas sheet...")

    # Read all sheets
    excel_file = pd.ExcelFile(INPUT_FILE)
    all_sheets = {sheet: pd.read_excel(INPUT_FILE, sheet_name=sheet) for sheet in excel_file.sheet_names}

    # Get geocercas sheet
    df = all_sheets['geocercas']

    print(f"📊 Found {len(df)} geofences")
    print(f"   - {len(df[df.tipo == 'pension'])} pension geofences")
    print(f"   - {len(df[df.tipo == 'taller'])} taller geofences")
    print(f"   - {len(df[df.tipo == 'cliente'])} cliente geofences")
    print()

    # Add missing columns if they don't exist
    if 'status_entrada' not in df.columns:
        print("✅ Adding 'status_entrada' column")
        df['status_entrada'] = ''

    if 'status_salida' not in df.columns:
        print("✅ Adding 'status_salida' column")
        df['status_salida'] = ''

    print()

    # Fix PENSION geofences
    pension_mask = df['tipo'] == 'pension'
    pension_count = pension_mask.sum()

    if pension_count > 0:
        print(f"🔄 Fixing {pension_count} PENSION geofences...")
        df.loc[pension_mask, 'status_entrada'] = 'Disponible'
        df.loc[pension_mask, 'status_salida'] = 'Disponible'
        df.loc[pension_mask, 'actividad_entrada'] = 'Esperando asignación'
        df.loc[pension_mask, 'actividad_salida'] = 'Saliendo de pensión'
        print(f"   ✓ Set status_entrada = 'Disponible'")
        print(f"   ✓ Set status_salida = 'Disponible'")
        print(f"   ✓ Set actividad_entrada = 'Esperando asignación'")
        print(f"   ✓ Set actividad_salida = 'Saliendo de pensión'")
        print()

    # Fix TALLER geofences
    taller_mask = df['tipo'] == 'taller'
    taller_count = taller_mask.sum()

    if taller_count > 0:
        print(f"🔄 Fixing {taller_count} TALLER geofences...")
        df.loc[taller_mask, 'status_entrada'] = 'En Taller'
        df.loc[taller_mask, 'status_salida'] = 'Disponible'
        df.loc[taller_mask, 'actividad_entrada'] = 'Mantenimiento'
        df.loc[taller_mask, 'actividad_salida'] = 'Esperando asignación'
        print(f"   ✓ Set status_entrada = 'En Taller'")
        print(f"   ✓ Set status_salida = 'Disponible'")
        print()

    # Fix CLIENTE geofences
    cliente_mask = df['tipo'] == 'cliente'
    cliente_count = cliente_mask.sum()

    if cliente_count > 0:
        print(f"🔄 Fixing {cliente_count} CLIENTE geofences...")
        df.loc[cliente_mask, 'status_entrada'] = 'Descargando'
        df.loc[cliente_mask, 'status_salida'] = 'En Ruta'
        df.loc[cliente_mask, 'actividad_entrada'] = 'Entrega en curso'
        df.loc[cliente_mask, 'actividad_salida'] = 'Tránsito'
        print(f"   ✓ Set status_entrada = 'Descargando'")
        print(f"   ✓ Set status_salida = 'En Ruta'")
        print()

    # Fix CASETA geofences
    caseta_mask = df['tipo'] == 'caseta'
    caseta_count = caseta_mask.sum()

    if caseta_count > 0:
        print(f"🔄 Fixing {caseta_count} CASETA geofences...")
        df.loc[caseta_mask, 'status_entrada'] = 'En Ruta'
        df.loc[caseta_mask, 'status_salida'] = 'En Ruta'
        df.loc[caseta_mask, 'actividad_entrada'] = 'Tránsito autopista'
        df.loc[caseta_mask, 'actividad_salida'] = 'Tránsito'
        print(f"   ✓ Set status_entrada = 'En Ruta'")
        print(f"   ✓ Set status_salida = 'En Ruta'")
        print()

    # Fix RUTA geofences
    ruta_mask = df['tipo'] == 'ruta'
    ruta_count = ruta_mask.sum()

    if ruta_count > 0:
        print(f"🔄 Fixing {ruta_count} RUTA geofences...")
        df.loc[ruta_mask, 'status_entrada'] = 'En Ruta'
        df.loc[ruta_mask, 'status_salida'] = 'Alerta'
        df.loc[ruta_mask, 'actividad_entrada'] = 'Siguiendo ruta'
        df.loc[ruta_mask, 'actividad_salida'] = 'Desvío de ruta'
        print(f"   ✓ Set status_entrada = 'En Ruta'")
        print(f"   ✓ Set status_salida = 'Alerta'")
        print()

    # Fix OTHER geofences (default behavior)
    other_mask = ~df['tipo'].isin(['pension', 'taller', 'cliente', 'caseta', 'ruta'])
    other_count = other_mask.sum()

    if other_count > 0:
        print(f"🔄 Fixing {other_count} OTHER geofences...")
        df.loc[other_mask, 'status_entrada'] = 'En Ruta'
        df.loc[other_mask, 'status_salida'] = 'En Ruta'
        df.loc[other_mask & (df['actividad_entrada'] == ''), 'actividad_entrada'] = 'Verificar ubicación'
        df.loc[other_mask & (df['actividad_salida'] == ''), 'actividad_salida'] = 'Tránsito'
        print()

    # Update the sheets dictionary
    all_sheets['geocercas'] = df

    # Save to new Excel file
    print(f"💾 Saving fixed file to: {OUTPUT_FILE}")
    with pd.ExcelWriter(OUTPUT_FILE, engine='openpyxl') as writer:
        for sheet_name, sheet_df in all_sheets.items():
            sheet_df.to_excel(writer, sheet_name=sheet_name, index=False)

    print()
    print("✅ SUCCESS! File fixed and saved.")
    print()
    print("📋 Summary of changes:")
    print(f"   - Added status_entrada and status_salida columns")
    print(f"   - Fixed {pension_count} pension geofences")
    print(f"   - Fixed {taller_count} taller geofences")
    print(f"   - Fixed {cliente_count} cliente geofences")
    print(f"   - Fixed {caseta_count} caseta geofences")
    print(f"   - Fixed {ruta_count} ruta geofences")
    print(f"   - Fixed {other_count} other geofences")
    print()
    print("🚀 Next steps:")
    print("   1. Upload ELAM_Fleet_Data_FIXED.xlsx to Google Sheets")
    print("   2. Replace the existing geocercas sheet")
    print("   3. Test by moving a unit into a pension geofence")
    print("   4. Verify the status changes to 'Disponible'")

    return df

if __name__ == '__main__':
    try:
        fix_geocercas()
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
