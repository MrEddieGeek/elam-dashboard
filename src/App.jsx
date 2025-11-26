import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, Clock, AlertCircle, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { KPICards } from '@/components/KPICards';
import { UnitsGrid } from '@/components/UnitsGrid';
import { UnitsTable } from '@/components/UnitsTable';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';

// Configuration constants
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE';
const SHEET_NAME = 'status_operativo';
const LIVE_DATA_SHEET = 'live_data';
const UPDATE_INTERVAL = parseInt(import.meta.env.VITE_UPDATE_INTERVAL) || 120000; // 2 minutes default
const GOOGLE_SHEETS_JSON_PREFIX = '/*O_o*/\ngoogle.visualization.Query.setResponse(';

const ELAMDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  /**
   * Helper function to parse Google Sheets API response
   * Handles Google's JSONP wrapper format
   */
  const parseGoogleSheetsResponse = (text) => {
    let jsonText = text;
    if (text.startsWith(GOOGLE_SHEETS_JSON_PREFIX)) {
      // Remove the wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse( ... );
      jsonText = text.substring(GOOGLE_SHEETS_JSON_PREFIX.length);
      jsonText = jsonText.substring(0, jsonText.lastIndexOf(');'));
    } else if (text.includes('google.visualization.Query.setResponse(')) {
      // Fallback for slight format variations
      const startIdx = text.indexOf('({');
      const endIdx = text.lastIndexOf('});');
      if (startIdx !== -1 && endIdx !== -1) {
        jsonText = text.substring(startIdx + 1, endIdx + 1);
      }
    }
    return JSON.parse(jsonText);
  };

  /**
   * Fetch status_operativo sheet data
   */
  const fetchStatusData = async () => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error fetching status_operativo: ${response.status}`);
    }

    const text = await response.text();
    const json = parseGoogleSheetsResponse(text);

    if (!json.table || !json.table.rows) {
      throw new Error('Invalid data structure from status_operativo sheet');
    }

    return json.table.rows.map(row => ({
      unidad: row.c[0]?.v || '',
      actividad: row.c[1]?.v || '',
      ubicacion: row.c[2]?.v || '',
      proximoMovimiento: row.c[3]?.v || '',
      operador: row.c[4]?.v || '',
      estatus: row.c[5]?.v || '',
      ultimaActualizacion: row.c[6]?.v || '',
      rutasSemana: row.c[7]?.v || 0
    })).filter(row => row.unidad); // Filter empty rows
  };

  /**
   * Fetch live_data sheet data
   */
  const fetchLiveData = async () => {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${LIVE_DATA_SHEET}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Could not fetch live_data: ${response.status}`);
        return [];
      }

      const text = await response.text();
      const json = parseGoogleSheetsResponse(text);

      if (!json.table || !json.table.rows) {
        console.warn('Invalid data structure from live_data sheet');
        return [];
      }

      return json.table.rows.map(row => ({
        unidad: row.c[1]?.v || '',  // Column 1: unidad
        velocidad_kmh: row.c[4]?.v || '0',  // Column 4: velocidad_kmh
        odometro_km: row.c[7]?.v || '0',  // Column 7: odometro_km
        motor_estado: row.c[5]?.v || '',  // Column 5: motor_estado
        combustible_litros: row.c[6]?.v || '0',  // Column 6: combustible_litros
        lat: row.c[2]?.v || '',  // Column 2: lat
        lng: row.c[3]?.v || ''   // Column 3: lng
      })).filter(row => row.unidad);
    } catch (error) {
      console.warn('Error fetching live_data, continuing without live metrics:', error);
      return [];
    }
  };

  /**
   * Join status and live data by unit ID
   */
  const joinDataByUnit = (statusData, liveData) => {
    // Create a Map for fast lookup of live data by unit ID
    const liveDataMap = new Map(liveData.map(item => [item.unidad, item]));

    // Merge status data with corresponding live data
    return statusData.map(statusItem => {
      const liveItem = liveDataMap.get(statusItem.unidad);
      return {
        ...statusItem,
        // Add live data fields (or defaults if not found)
        velocidad_kmh: liveItem?.velocidad_kmh || '0',
        odometro_km: liveItem?.odometro_km || '0',
        motor_estado: liveItem?.motor_estado || '',
        combustible_litros: liveItem?.combustible_litros || '0',
        lat: liveItem?.lat || '',
        lng: liveItem?.lng || ''
      };
    });
  };

  /**
   * Main data fetching function - fetches both sheets and merges them
   */
  const fetchData = async () => {
    try {
      setError(null);

      // Fetch both sheets in parallel for performance
      const [statusData, liveData] = await Promise.all([
        fetchStatusData(),
        fetchLiveData()
      ]);

      // Join the data by unit ID
      const mergedData = joinDataByUnit(statusData, liveData);

      setData(mergedData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error al cargar datos: ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const statusOptions = ['Todos', ...new Set(data.map(d => d.estatus).filter(s => s))];

  const filteredData = data.filter(item => {
    const matchesFilter = filter === 'Todos' || item.estatus === filter;
    const matchesSearch =
      item.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actividad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.operador && item.operador.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Error Notification */}
      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-200 mb-1">Error al cargar datos</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-colors"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-800">
              <Truck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                ELAM Logistics
              </h1>
              <p className="text-slate-400 text-sm">Sistema de Gestión de Flota</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ExportButton data={filteredData} filename="ELAM_Dashboard" />
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        <p className="text-slate-400 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          Última actualización: {lastUpdate ? lastUpdate.toLocaleTimeString('es-MX') : 'Cargando...'}
        </p>
      </div>

      {/* KPI Cards */}
      {!loading && <KPICards data={data} lastUpdate={lastUpdate} />}

      {/* Filters and View Toggle */}
      <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700 shadow-xl">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por unidad, ubicación, actividad u operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Tarjetas
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2"
              >
                <TableIcon className="h-4 w-4" />
                Tabla
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />
          <p>Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Data Display - Grid or Table */}
          {viewMode === 'grid' ? (
            <UnitsGrid data={filteredData} />
          ) : (
            <UnitsTable data={filteredData} />
          )}

          {/* Results Counter */}
          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">No se encontraron resultados</p>
              <p className="text-sm">Intenta ajustar los filtros o el término de búsqueda</p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-slate-500 text-sm space-y-1">
        <p className="font-medium">Dashboard ELAM Logistics v2.0</p>
        <p>{filteredData.length} de {data.length} unidades mostradas</p>
        <p className="text-xs">Sistema de actualización automática activo ✅</p>
      </div>
    </div>
  );
};

export default ELAMDashboard;
