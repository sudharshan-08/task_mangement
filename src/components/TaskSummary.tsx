import React from 'react';
import { TaskSummaryCounts } from '@/types/task';
import { Circle, Clock, CheckCircle2, ListTodo } from 'lucide-react';

interface TaskSummaryProps {
  counts: TaskSummaryCounts;
}

export const TaskSummary: React.FC<TaskSummaryProps> = ({ counts }) => {
  const completionPercentage = counts.total > 0 ? Math.round((counts.complete / counts.total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Task Overview</h2>
          <p className="text-xs text-slate-500">Real-time status distribution of your tasks</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
          <ListTodo size={14} className="text-indigo-600" />
          <span>Total Tasks: <strong className="text-slate-900">{counts.total}</strong></span>
          <span className="text-slate-300">|</span>
          <span>{completionPercentage}% Finished</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Planned Tasks */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Planned Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Circle size={18} className="fill-slate-400 text-slate-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {counts.planned}
            </span>
            <span className="text-xs text-slate-500">
              {counts.total > 0 ? `${Math.round((counts.planned / counts.total) * 100)}% of total` : 'No tasks yet'}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-slate-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${counts.total > 0 ? (counts.planned / counts.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              In Progress Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-blue-900">
              {counts.inProgress}
            </span>
            <span className="text-xs text-blue-600">
              {counts.total > 0 ? `${Math.round((counts.inProgress / counts.total) * 100)}% of total` : 'Active work'}
            </span>
          </div>
          <div className="mt-3 w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${counts.total > 0 ? (counts.inProgress / counts.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Completed Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-900">
              {counts.complete}
            </span>
            <span className="text-xs text-emerald-600">
              {counts.total > 0 ? `${Math.round((counts.complete / counts.total) * 100)}% completed` : 'Resolved'}
            </span>
          </div>
          <div className="mt-3 w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${counts.total > 0 ? (counts.complete / counts.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
