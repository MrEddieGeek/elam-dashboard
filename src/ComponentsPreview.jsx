import React from 'react';
import { StatusBadge, StatusBadgeCompact } from './components/StatusBadge';
import { KPICards } from './components/KPICards';
import { ExportButton, ExportButtonCompact } from './components/ExportButton';
import { UnitsGrid } from './components/UnitsGrid';
import { UnitsTable } from './components/UnitsTable';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

// Datos de ejemplo para el preview
const mockData = [
  {
    unidad: 'T-001',
    estatus: 'En ruta',
    actividad: 'Transporte de carga',
    ubicacion: 'Carretera Federal 200, Michoacán',
    proximoMovimiento: 'Llegada a puerto estimada 14:30',
    operador: 'Juan Pérez',
    ultimaActualizacion: '2025-11-11 12:30:00'
  },
  {
    unidad: 'T-002',
    estatus: 'En puerto',
    actividad: 'Esperando carga',
    ubicacion: 'Puerto Lázaro Cárdenas',
    proximoMovimiento: 'Carga programada 15:00',
    operador: 'María González',
    ultimaActualizacion: '2025-11-11 11:15:00'
  },
  {
    unidad: 'T-003',
    estatus: 'En taller',
    actividad: 'Mantenimiento correctivo',
    ubicacion: 'Taller Quintanar',
    proximoMovimiento: 'En reparación',
    operador: '',
    ultimaActualizacion: '2025-11-11 09:00:00'
  },
  {
    unidad: 'T-004',
    estatus: 'Disponible',
    actividad: 'Lista para asignar',
    ubicacion: 'Base Lázaro Cárdenas',
    proximoMovimiento: 'Pendiente de asignación',
    operador: 'Carlos Ramírez',
    ultimaActualizacion: '2025-11-11 10:45:00'
  },
  {
    unidad: 'T-005',
    estatus: 'Descargando',
    actividad: 'Descarga en cliente',
    ubicacion: 'Cliente Gas del Mar',
    proximoMovimiento: 'Regreso a base',
    operador: 'Luis Martínez',
    ultimaActualizacion: '2025-11-11 13:00:00'
  },
  {
    unidad: 'T-006',
    estatus: 'Mantenimiento ligero',
    actividad: 'Revisión preventiva',
    ubicacion: 'Taller Base',
    proximoMovimiento: 'Finaliza en 2 horas',
    operador: 'Ana Torres',
    ultimaActualizacion: '2025-11-11 11:30:00'
  },
];

function ComponentsPreview() {
  const allStatuses = [
    'En ruta',
    'En puerto',
    'Disponible',
    'Descargando',
    'Esperando carga',
    'En taller',
    'Mantenimiento ligero',
    'Pensión'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            Preview de Componentes Nuevos
          </h1>
          <p className="text-slate-300">
            Sesiones 1-4: Setup + Estados + Tarjetas + Tabla Mejorada
          </p>
        </div>

        {/* KPI Cards */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">1. KPI Cards - Métricas Principales</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              6 tarjetas con animación de entrada y actualización de valores
            </p>
          </CardHeader>
          <CardContent>
            <KPICards data={mockData} lastUpdate={new Date()} />
          </CardContent>
        </Card>

        {/* Units Grid - Vista de Tarjetas */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">2. Units Grid - Vista de Tarjetas</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Grid responsivo con información completa de cada unidad
            </p>
          </CardHeader>
          <CardContent>
            <UnitsGrid data={mockData} />
          </CardContent>
        </Card>

        {/* Units Table - Tabla Mejorada */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">3. Units Table - Tabla Mejorada</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Tabla con búsqueda y ordenamiento por columnas
            </p>
          </CardHeader>
          <CardContent>
            <UnitsTable data={mockData} />
          </CardContent>
        </Card>

        {/* Status Badges - Versión Normal */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">4. Status Badges - Versión Normal</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Con indicador de punto y animación pulse en "En ruta"
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allStatuses.map((status, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Badges - Versión Compacta */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">5. Status Badges - Versión Compacta</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Sin indicador de punto, más pequeña para tablas
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allStatuses.map((status, index) => (
                <StatusBadgeCompact key={index} status={status} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">6. Export Buttons</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Exportación a Excel/CSV con menú dropdown
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm font-medium mb-2 text-slate-300">Versión Normal:</p>
                <ExportButton data={mockData} filename="Test_Export" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-slate-300">Versión Compacta (icono):</p>
                <ExportButtonCompact data={mockData} filename="Test_Export" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Reference */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">7. Paleta de Colores por Estado</CardTitle>
            <p className="text-sm text-slate-400 mt-2">
              Referencia visual de colores utilizados
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ColorSwatch color="blue" label="En ruta" />
              <ColorSwatch color="green" label="En puerto" />
              <ColorSwatch color="emerald" label="Disponible" />
              <ColorSwatch color="orange" label="Descargando" />
              <ColorSwatch color="amber" label="Esperando carga" />
              <ColorSwatch color="red" label="En taller" />
              <ColorSwatch color="yellow" label="Mantenimiento" />
              <ColorSwatch color="slate" label="Pensión" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 py-8">
          <p>Este es un preview temporal - Los componentes se integrarán en App.jsx</p>
          <p className="mt-2">Puedes hacer ajustes antes de continuar con la Sesión 3</p>
        </div>

      </div>
    </div>
  );
}

// Componente auxiliar para mostrar colores (Night mode)
function ColorSwatch({ color, label }) {
  const colors = {
    blue: 'bg-blue-900/90 border-blue-700 text-blue-100',
    green: 'bg-green-900/90 border-green-700 text-green-100',
    emerald: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
    orange: 'bg-orange-900/90 border-orange-700 text-orange-100',
    amber: 'bg-amber-900/90 border-amber-700 text-amber-100',
    red: 'bg-red-900/90 border-red-700 text-red-100',
    yellow: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
    slate: 'bg-slate-800/90 border-slate-600 text-slate-100',
  };

  const dotColors = {
    blue: 'bg-blue-400',
    green: 'bg-green-400',
    emerald: 'bg-emerald-400',
    orange: 'bg-orange-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    slate: 'bg-slate-300',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[color]}`}>
      <div className="flex items-center gap-2">
        <div className={`h-4 w-4 rounded-full ${dotColors[color]}`} />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

export default ComponentsPreview;
