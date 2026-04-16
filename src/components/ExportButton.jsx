import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToCSV } from '@/lib/export';
import { cn } from '@/lib/utils';

/**
 * Botón para exportar datos a Excel o CSV
 * @param {Array} data - Datos a exportar
 * @param {string} filename - Nombre base del archivo
 */
export function ExportButton({ data = [], filename = 'ELAM_Dashboard', className }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      // Preparar datos para exportación (limpiar campos innecesarios)
      const exportData = data.map(item => ({
        Unidad: item.unidad,
        Estatus: item.estatus,
        Actividad: item.actividad,
        Ubicación: item.ubicacion,
        'Próximo Movimiento': item.proximoMovimiento || '',
        Operador: item.operador || '',
        'Última Actualización': item.ultimaActualizacion || ''
      }));

      if (format === 'excel') {
        await exportToExcel(exportData, filename);
      } else if (format === 'csv') {
        await exportToCSV(exportData, filename);
      }

      // Pequeño delay para feedback visual
      setTimeout(() => setIsExporting(false), 500);
    } catch (error) {
      console.error('Error al exportar:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="default"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || data.length === 0}
        className="gap-2"
      >
        <Download className={cn('h-4 w-4', isExporting && 'animate-bounce')} />
        {isExporting ? 'Exportando...' : 'Exportar'}
      </Button>

      {/* Menú dropdown */}
      {showMenu && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menú */}
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1" role="menu">
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span>Exportar como Excel</span>
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Exportar como CSV</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Variante compacta solo con icono
export function ExportButtonCompact({ data = [], filename = 'ELAM_Dashboard', className }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportData = data.map(item => ({
        Unidad: item.unidad,
        Estatus: item.estatus,
        Actividad: item.actividad,
        Ubicación: item.ubicacion,
        'Próximo Movimiento': item.proximoMovimiento || '',
        Operador: item.operador || '',
        'Última Actualización': item.ultimaActualizacion || ''
      }));

      await exportToExcel(exportData, filename);
      setTimeout(() => setIsExporting(false), 500);
    } catch (error) {
      console.error('Error al exportar:', error);
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className={cn('h-8 w-8', className)}
      title="Exportar a Excel"
    >
      <Download className={cn('h-4 w-4', isExporting && 'animate-bounce')} />
    </Button>
  );
}
