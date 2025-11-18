import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Truck, MapPin, Activity, User, Clock, Navigation, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Vista de tarjetas para unidades
 * @param {Array} data - Array de unidades
 * @param {string} className - Clases CSS adicionales
 */
export function UnitsGrid({ data = [], className }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay unidades para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
      className
    )}>
      {data.map((unit, index) => (
        <UnitCard key={unit.unidad || index} unit={unit} index={index} />
      ))}
    </div>
  );
}

function UnitCard({ unit, index }) {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
    >
      <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 overflow-hidden">
        {/* Header con ID de unidad y status */}
        <CardHeader className="pb-3 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-950/50 border border-blue-800">
                <Truck className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {unit.unidad || 'N/A'}
                </h3>
              </div>
            </div>
            <StatusBadge status={unit.estatus || 'Desconocido'} animate={true} />
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {/* Actividad */}
          <InfoRow
            icon={Activity}
            label="Actividad"
            value={unit.actividad || 'Sin información'}
            iconColor="text-orange-400"
            iconBg="bg-orange-950/50"
          />

          {/* Ubicación */}
          <InfoRow
            icon={MapPin}
            label="Ubicación"
            value={unit.ubicacion || 'Sin ubicación'}
            iconColor="text-green-400"
            iconBg="bg-green-950/50"
            truncate
          />

          {/* Próximo Movimiento */}
          {unit.proximoMovimiento && (
            <InfoRow
              icon={Navigation}
              label="Próximo Movimiento"
              value={unit.proximoMovimiento}
              iconColor="text-purple-400"
              iconBg="bg-purple-950/50"
              truncate
            />
          )}

          {/* Operador */}
          <InfoRow
            icon={User}
            label="Operador"
            value={unit.operador || 'Sin asignar'}
            iconColor="text-blue-400"
            iconBg="bg-blue-950/50"
          />

          {/* Rutas completadas esta semana */}
          {unit.rutasSemana !== undefined && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
              <div className="p-1.5 rounded-md bg-emerald-950/50">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-emerald-400 font-medium">
                  {unit.rutasSemana || 0} {unit.rutasSemana === 1 ? 'ruta completada' : 'rutas completadas'} esta semana
                </p>
              </div>
            </div>
          )}

          {/* Última Actualización */}
          <div className="pt-3 mt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{formatLastUpdate(unit.ultimaActualizacion)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value, iconColor, iconBg, truncate = false }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn('p-1.5 rounded-md', iconBg)}>
        <Icon className={cn('h-3.5 w-3.5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className={cn(
          'text-sm text-slate-200 font-medium',
          truncate && 'truncate'
        )} title={truncate ? value : undefined}>
          {value}
        </p>
      </div>
    </div>
  );
}
