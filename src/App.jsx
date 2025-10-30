import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Wrench, AlertCircle, RefreshCw, Clock, Package } from 'lucide-react';

const SHEET_ID = '1KKTGm1dw3oPiEZJfp3Ydiz01ElMonrkWa7zMkLc_NHE';
const SHEET_NAME = 'status_operativo';

const ELAMDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
      const response = await fetch(url);
      const text = await response.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));
      
      const rows = json.table.rows.map(row => ({
        unidad: row.c[0]?.v || '',
        actividad: row.c[1]?.v || '',
        ubicacion: row.c[2]?.v || '',
        proximoMovimiento: row.c[3]?.v || '',
        operador: row.c[4]?.v || '',
        estatus: row.c[5]?.v || ''
      }));
      
      setData(rows);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000); // Actualiza cada 2 minutos
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'En ruta': 'bg-blue-500',
      'Programado': 'bg-purple-500',
      'En puerto': 'bg-green-500',
      'Mantenimiento ligero': 'bg-yellow-500',
      'Descargando': 'bg-orange-500',
      'Esperando carga': 'bg-amber-500',
      'Descanso': 'bg-gray-500',
      'Taller': 'bg-red-500',
      'Legal': 'bg-red-700'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusIcon = (status) => {
    if (status.includes('ruta')) return <Truck className="w-5 h-5" />;
    if (status.includes('Taller') || status.includes('Mantenimiento')) return <Wrench className="w-5 h-5" />;
    if (status.includes('puerto')) return <Package className="w-5 h-5" />;
    if (status.includes('Legal')) return <AlertCircle className="w-5 h-5" />;
    return <MapPin className="w-5 h-5" />;
  };

  const calculateKPIs = () => {
    const total = data.length;
    const enRuta = data.filter(u => u.estatus === 'En ruta').length;
    const enTaller = data.filter(u => u.estatus === 'Taller' || u.estatus === 'Mantenimiento ligero').length;
    const disponibles = data.filter(u => u.estatus === 'En puerto').length;
    const descargando = data.filter(u => u.estatus === 'Descargando').length;
    
    return { total, enRuta, enTaller, disponibles, descargando };
  };

  const kpis = calculateKPIs();

  const statusOptions = ['Todos', ...new Set(data.map(d => d.estatus))];

  const filteredData = data.filter(item => {
    const matchesFilter = filter === 'Todos' || item.estatus === filter;
    const matchesSearch = item.unidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Truck className="w-10 h-10 text-blue-400" />
            ELAM Logistics
          </h1>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        <p className="text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Última actualización: {lastUpdate ? lastUpdate.toLocaleTimeString('es-MX') : 'Cargando...'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{kpis.total}</div>
          <div className="text-sm text-gray-400">Total Unidades</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-blue-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Truck className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-1">{kpis.enRuta}</div>
          <div className="text-sm text-gray-400">En Ruta</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-red-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Wrench className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">{kpis.enTaller}</div>
          <div className="text-sm text-gray-400">En Taller</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-green-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">{kpis.disponibles}</div>
          <div className="text-sm text-gray-400">Disponibles</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-orange-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-1">{kpis.descargando}</div>
          <div className="text-sm text-gray-400">Descargando</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por unidad o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Unidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actividad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ubicación</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Próximo Movimiento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Operador</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{item.unidad}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.actividad}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        {item.ubicacion}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{item.proximoMovimiento}</td>
                    <td className="px-6 py-4 text-gray-300">{item.operador || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm ${getStatusColor(item.estatus)}`}>
                        {getStatusIcon(item.estatus)}
                        {item.estatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Dashboard ELAM Logistics v1.0 | {filteredData.length} de {data.length} unidades mostradas</p>
      </div>
    </div>
  );
};

export default ELAMDashboard;