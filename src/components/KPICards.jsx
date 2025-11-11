import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Wrench, AlertCircle, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de tarjetas KPI que muestra métricas clave del dashboard
 * @param {Array} data - Array de datos de unidades
 * @param {string} lastUpdate - Timestamp de última actualización
 */
export function KPICards({ data = [], lastUpdate }) {
  // Calcular métricas
  const total = data.length;

  const enRuta = data.filter(u => u.estatus?.toLowerCase().includes('ruta')).length;

  const enTaller = data.filter(u =>
    u.estatus?.toLowerCase().includes('taller')
  ).length;

  const enMantenimiento = data.filter(u =>
    u.estatus?.toLowerCase().includes('mantenimiento')
  ).length;

  const disponibles = data.filter(u =>
    u.estatus?.toLowerCase().includes('disponible') ||
    u.estatus?.toLowerCase().includes('puerto')
  ).length;

  const descargando = data.filter(u =>
    u.estatus?.toLowerCase().includes('descargando') ||
    u.estatus?.toLowerCase().includes('descarga')
  ).length;

  const esperandoCarga = data.filter(u =>
    u.estatus?.toLowerCase().includes('esperando')
  ).length;

  // Último evento (unidad con actualización más reciente)
  const ultimoEvento = data.length > 0 ? data[0] : null;

  // Alertas (unidades sin actividad > 6 horas - simplificado por ahora)
  const alertas = 0; // TODO: Implementar lógica de alertas basada en timestamps

  const kpiData = [
    {
      title: 'Total Unidades',
      value: total,
      subtitle: `${disponibles} disponibles`,
      icon: Truck,
      color: 'text-slate-300',
      bgColor: 'bg-slate-800/50',
      borderColor: 'border-slate-600',
    },
    {
      title: 'En Ruta',
      value: enRuta,
      subtitle: `${((enRuta / total) * 100).toFixed(0)}% del total`,
      icon: MapPin,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/50',
      borderColor: 'border-blue-700',
    },
    {
      title: 'Taller/Mantenimiento',
      value: enTaller + enMantenimiento,
      subtitle: `${enTaller} taller, ${enMantenimiento} mantenimiento`,
      icon: Wrench,
      color: 'text-red-400',
      bgColor: 'bg-red-950/50',
      borderColor: 'border-red-700',
    },
    {
      title: 'Disponibles',
      value: disponibles,
      subtitle: 'Listas para asignar',
      icon: Package,
      color: 'text-green-400',
      bgColor: 'bg-green-950/50',
      borderColor: 'border-green-700',
    },
    {
      title: 'En Operación',
      value: descargando + esperandoCarga,
      subtitle: `${descargando} descargando, ${esperandoCarga} esperando`,
      icon: Package,
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/50',
      borderColor: 'border-orange-700',
    },
    {
      title: 'Último Evento',
      value: ultimoEvento?.unidad || '--',
      subtitle: ultimoEvento?.ubicacion ? ultimoEvento.ubicacion.substring(0, 30) + '...' : 'Sin datos',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/50',
      borderColor: 'border-purple-700',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} index={index} />
      ))}
    </div>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  isText = false,
  index
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={cn(
        'hover:shadow-md transition-shadow duration-300 border-l-4 bg-slate-900/50 border-slate-700',
        borderColor
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-slate-300">
            {title}
          </CardTitle>
          <div className={cn('p-2 rounded-full', bgColor)}>
            <Icon className={cn('h-4 w-4', color)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            'font-bold mb-1',
            isText ? 'text-xl' : 'text-3xl',
            color
          )}>
            {isText ? (
              <span className="font-mono">{value}</span>
            ) : (
              <motion.span
                key={value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {value}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
