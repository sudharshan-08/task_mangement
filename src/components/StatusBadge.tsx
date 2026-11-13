import React from 'react';
import { TaskStatus } from '@/types/task';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-xs px-2 py-0.5 gap-1.5' : 'text-xs font-medium px-2.5 py-1 gap-1.5';
  const iconSize = isSm ? 12 : 14;

  switch (status) {
    case 'Planned':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses}`}
        >
          <Circle size={iconSize} className="text-slate-400 fill-slate-400" />
          <span>Planned</span>
        </span>
      );
    case 'In Progress':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 ${sizeClasses}`}
        >
          <Clock size={iconSize} className="text-blue-600 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'Complete':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 ${sizeClasses}`}
        >
          <CheckCircle2 size={iconSize} className="text-emerald-600 fill-emerald-100 dark:fill-emerald-900" />
          <span>Complete</span>
        </span>
      );
    default:
      return null;
  }
};

