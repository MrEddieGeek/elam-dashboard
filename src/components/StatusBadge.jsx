import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Badge de status con colores profesionales y animación sutil
 * @param {string} status - Estado de la unidad
 * @param {boolean} animate - Activar animación pulse para "En ruta"
 */
export function StatusBadge({ status, animate = true, className }) {
  const statusLower = status.toLowerCase();

  // Mapeo de status a variantes de color (Night mode)
  const getStatusStyle = () => {
    // En ruta - Azul
    if (statusLower.includes('ruta')) {
      return 'bg-blue-900/90 text-blue-100 border-blue-700';
    }

    // En puerto - Verde
    if (statusLower.includes('puerto')) {
      return 'bg-green-900/90 text-green-100 border-green-700';
    }

    // Disponible - Verde claro
    if (statusLower.includes('disponible')) {
      return 'bg-emerald-900/90 text-emerald-100 border-emerald-700';
    }

    // Descargando - Naranja
    if (statusLower.includes('descargando') || statusLower.includes('descarga')) {
      return 'bg-orange-900/90 text-orange-100 border-orange-700';
    }

    // Esperando carga - Amarillo
    if (statusLower.includes('esperando')) {
      return 'bg-amber-900/90 text-amber-100 border-amber-700';
    }

    // Taller - Rojo
    if (statusLower.includes('taller')) {
      return 'bg-red-900/90 text-red-100 border-red-700';
    }

    // Mantenimiento ligero - Amarillo suave
    if (statusLower.includes('mantenimiento')) {
      return 'bg-yellow-900/90 text-yellow-100 border-yellow-700';
    }

    // Pensión - Gris oscuro
    if (statusLower.includes('pensión') || statusLower.includes('pension')) {
      return 'bg-slate-800/90 text-slate-100 border-slate-600';
    }

    // Default - Neutro
    return 'bg-gray-800/90 text-gray-100 border-gray-600';
  };

  // Indicador de status activo (punto de color) - Night mode
  const getIndicatorColor = () => {
    if (statusLower.includes('ruta')) return 'bg-blue-400';
    if (statusLower.includes('puerto')) return 'bg-green-400';
    if (statusLower.includes('disponible')) return 'bg-emerald-400';
    if (statusLower.includes('descargando') || statusLower.includes('descarga')) return 'bg-orange-400';
    if (statusLower.includes('esperando')) return 'bg-amber-400';
    if (statusLower.includes('taller')) return 'bg-red-400';
    if (statusLower.includes('mantenimiento')) return 'bg-yellow-400';
    return 'bg-gray-300';
  };

  const shouldPulse = animate && statusLower.includes('ruta');

  const badgeContent = (
    <Badge
      className={cn(
        'px-3 py-1 text-xs font-medium border',
        getStatusStyle(),
        className
      )}
    >
      <span className="flex items-center gap-2">
        {/* Indicador de punto con pulse animation para "En ruta" */}
        {shouldPulse ? (
          <motion.span
            className={cn('h-2 w-2 rounded-full', getIndicatorColor())}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ) : (
          <span className={cn('h-2 w-2 rounded-full', getIndicatorColor())} />
        )}
        <span>{status}</span>
      </span>
    </Badge>
  );

  return badgeContent;
}

// Variante compacta sin indicador de punto
export function StatusBadgeCompact({ status, className }) {
  const statusLower = status.toLowerCase();

  const getStatusStyle = () => {
    if (statusLower.includes('ruta')) {
      return 'bg-blue-900/90 text-blue-100 border-blue-700';
    }
    if (statusLower.includes('puerto')) {
      return 'bg-green-900/90 text-green-100 border-green-700';
    }
    if (statusLower.includes('disponible')) {
      return 'bg-emerald-900/90 text-emerald-100 border-emerald-700';
    }
    if (statusLower.includes('descargando') || statusLower.includes('descarga')) {
      return 'bg-orange-900/90 text-orange-100 border-orange-700';
    }
    if (statusLower.includes('esperando')) {
      return 'bg-amber-900/90 text-amber-100 border-amber-700';
    }
    if (statusLower.includes('taller')) {
      return 'bg-red-900/90 text-red-100 border-red-700';
    }
    if (statusLower.includes('mantenimiento')) {
      return 'bg-yellow-900/90 text-yellow-100 border-yellow-700';
    }
    if (statusLower.includes('pensión') || statusLower.includes('pension')) {
      return 'bg-slate-800/90 text-slate-100 border-slate-600';
    }
    return 'bg-gray-800/90 text-gray-100 border-gray-600';
  };

  return (
    <Badge className={cn('px-2 py-0.5 text-xs font-medium border', getStatusStyle(), className)}>
      {status}
    </Badge>
  );
}
