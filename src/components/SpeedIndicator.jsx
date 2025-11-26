import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SpeedIndicator component - Displays current vehicle speed with color-coded status
 * @param {Object} props
 * @param {string|number} props.speed - Speed value in km/h from live_data
 * @param {string} [props.className] - Optional Tailwind classes
 */
export function SpeedIndicator({ speed = 0, className = '' }) {
  const speedNum = parseInt(speed) || 0;

  /**
   * Returns Tailwind color class based on speed range
   * - Gray (0): Stopped/parked
   * - Green (1-60): Normal city/road driving
   * - Yellow (61-90): Highway speed
   * - Red (91+): Speed alert
   */
  const getColorClass = () => {
    if (speedNum === 0) return 'text-gray-400';
    if (speedNum <= 60) return 'text-green-400';
    if (speedNum <= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  const colorClass = getColorClass();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Gauge className={`w-4 h-4 ${colorClass}`} />
      <div className="text-sm">
        <span className={`font-bold ${colorClass}`}>{speedNum}</span>
        <span className="text-slate-400 ml-1">km/h</span>
      </div>
    </div>
  );
}
