import { Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * OdometerDisplay component - Displays total kilometers traveled
 * @param {Object} props
 * @param {string|number} props.odometer - Odometer value in km from live_data
 * @param {string} [props.className] - Optional Tailwind classes
 */
export function OdometerDisplay({ odometer = 0, className = '' }) {
  const odometerNum = parseInt(odometer) || 0;
  // Format with thousand separators for Spanish locale (12,543 km)
  const formatted = odometerNum.toLocaleString('es-MX');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Milestone className="w-4 h-4 text-slate-400" />
      <div className="text-sm text-slate-300">
        <span className="font-medium">{formatted}</span>
        <span className="text-slate-400 ml-1">km</span>
      </div>
    </div>
  );
}
