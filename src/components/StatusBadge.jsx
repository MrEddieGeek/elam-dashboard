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

  // Mapeo de status a variantes de color
  const getStatusStyle = () => {
    // En ruta - Azul
    if (statusLower.includes('ruta')) {
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300';
    }

    // En puerto - Verde
    if (statusLower.includes('puerto')) {
      return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300';
    }

    // Disponible - Verde claro
    if (statusLower.includes('disponible')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
    }

    // Descargando - Naranja
    if (statusLower.includes('descargando') || statusLower.includes('descarga')) {
      return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300';
    }

    // Esperando carga - Amarillo
    if (statusLower.includes('esperando')) {
      return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
    }

    // Taller - Rojo
    if (statusLower.includes('taller')) {
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300';
    }

    // Mantenimiento ligero - Amarillo suave
    if (statusLower.includes('mantenimiento')) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300';
    }

    // Descanso - Gris
    if (statusLower.includes('descanso')) {
      return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    }

    // Pensión - Gris oscuro
    if (statusLower.includes('pensión') || statusLower.includes('pension')) {
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }

    // Default - Neutro
    return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
  };

  // Indicador de status activo (punto de color)
  const getIndicatorColor = () => {
    if (statusLower.includes('ruta')) return 'bg-blue-500';
    if (statusLower.includes('puerto')) return 'bg-green-500';
    if (statusLower.includes('disponible')) return 'bg-emerald-500';
    if (statusLower.includes('descargando') || statusLower.includes('descarga')) return 'bg-orange-500';
    if (statusLower.includes('esperando')) return 'bg-amber-500';
    if (statusLower.includes('taller')) return 'bg-red-500';
    if (statusLower.includes('mantenimiento')) return 'bg-yellow-500';
    return 'bg-gray-400';
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
      return 'bg-blue-100 text-blue-700 border-blue-300';
    }
    if (statusLower.includes('puerto')) {
      return 'bg-green-100 text-green-700 border-green-300';
    }
    if (statusLower.includes('disponible')) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    }
    if (statusLower.includes('descargando') || statusLower.includes('descarga')) {
      return 'bg-orange-100 text-orange-700 border-orange-300';
    }
    if (statusLower.includes('esperando')) {
      return 'bg-amber-100 text-amber-700 border-amber-300';
    }
    if (statusLower.includes('taller')) {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    if (statusLower.includes('mantenimiento')) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
    if (statusLower.includes('descanso')) {
      return 'bg-gray-100 text-gray-700 border-gray-300';
    }
    if (statusLower.includes('pensión') || statusLower.includes('pension')) {
      return 'bg-slate-100 text-slate-700 border-slate-300';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <Badge className={cn('px-2 py-0.5 text-xs font-medium border', getStatusStyle(), className)}>
      {status}
    </Badge>
  );
}
