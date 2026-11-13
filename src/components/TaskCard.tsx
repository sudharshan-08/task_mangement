'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { StatusBadge } from './StatusBadge';
import { StatusDropdown } from './StatusDropdown';
import { Calendar, Clock3 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4 group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
            {task.title}
          </h3>
          <div className="shrink-0">
            <StatusBadge status={task.status} />
          </div>
        </div>

        {task.description ? (
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">No description provided</p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" title="Date created">
            <Calendar size={13} className="text-slate-400" />
            <span>{formatDate(task.created_at)}</span>
          </div>

          {task.updated_at && task.updated_at !== task.created_at && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 hidden sm:flex" title="Last updated">
              <Clock3 size={12} />
              <span>Updated {formatDate(task.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusDropdown
            currentStatus={task.status}
            onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
          />
        </div>
      </div>
    </div>
  );
};
