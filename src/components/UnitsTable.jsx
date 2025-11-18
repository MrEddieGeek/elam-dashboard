import React, { useState, useMemo } from 'react';
import { StatusBadgeCompact } from '@/components/StatusBadge';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Tabla mejorada para unidades con ordenamiento y búsqueda
 * @param {Array} data - Array de unidades
 * @param {string} className - Clases CSS adicionales
 */
export function UnitsTable({ data = [], className }) {
  const [sortField, setSortField] = useState('unidad');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Formatear última actualización
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Sin actualización';

    try {
      // Parse Google Sheets date format: "Date(2025,10,11,2,41,44)"
      if (typeof timestamp === 'string' && timestamp.startsWith('Date(')) {
        const matches = timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
        if (matches) {
          const [, year, month, day, hour, minute, second] = matches;
          // Month is 0-indexed in JavaScript Date
          const date = new Date(parseInt(year), parseInt(month), parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
          return formatDistanceToNow(date, { addSuffix: true, locale: es });
        }
      }

      // Fallback for standard date formats
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
      }

      return 'Sin actualización';
    } catch {
      return 'Sin actualización';
    }
  };

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();
    return data.filter(unit =>
      (unit.unidad?.toLowerCase().includes(term)) ||
      (unit.estatus?.toLowerCase().includes(term)) ||
      (unit.actividad?.toLowerCase().includes(term)) ||
      (unit.ubicacion?.toLowerCase().includes(term)) ||
      (unit.operador?.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle numeric fields (rutasSemana)
      if (sortField === 'rutasSemana') {
        aVal = parseInt(aVal) || 0;
        bVal = parseInt(bVal) || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle string fields
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Manejar click en header de columna para ordenar
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Componente de header con ordenamiento
  const SortableHeader = ({ field, children }) => {
    const isActive = sortField === field;

    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-2">
          {children}
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-blue-400" />
            ) : (
              <ArrowDown className="h-3 w-3 text-blue-400" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-slate-600" />
          )}
        </div>
      </th>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No hay unidades para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por unidad, estatus, actividad, ubicación u operador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
        />
      </div>

      {/* Resultados encontrados */}
      <div className="text-sm text-slate-400">
        Mostrando {sortedData.length} de {data.length} unidades
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900/50">
            <tr>
              <SortableHeader field="unidad">Unidad</SortableHeader>
              <SortableHeader field="estatus">Estatus</SortableHeader>
              <SortableHeader field="actividad">Actividad</SortableHeader>
              <SortableHeader field="ubicacion">Ubicación</SortableHeader>
              <SortableHeader field="proximoMovimiento">Próximo Movimiento</SortableHeader>
              <SortableHeader field="operador">Operador</SortableHeader>
              <SortableHeader field="rutasSemana">Rutas (semana)</SortableHeader>
              <SortableHeader field="ultimaActualizacion">Última Actualización</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-slate-900/30 divide-y divide-slate-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                  No se encontraron resultados para "{searchTerm}"
                </td>
              </tr>
            ) : (
              sortedData.map((unit, index) => (
                <tr
                  key={unit.unidad || index}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-slate-100">
                      {unit.unidad || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadgeCompact status={unit.estatus || 'Desconocido'} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">
                      {unit.actividad || 'Sin información'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300 max-w-xs truncate block" title={unit.ubicacion}>
                      {unit.ubicacion || 'Sin ubicación'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">
                      {unit.proximoMovimiento || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-slate-300">
                      {unit.operador || 'Sin asignar'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-950/30 border border-emerald-800/30 text-xs font-medium text-emerald-400">
                      {unit.rutasSemana || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-slate-500">
                      {formatLastUpdate(unit.ultimaActualizacion)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
