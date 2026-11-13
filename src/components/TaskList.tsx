'use client';

import React, { useState, useMemo } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Plus, Search, AlertCircle, RefreshCw, ClipboardList, Filter } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error?: string | null;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  error,
  onRefresh,
  onOpenCreateModal,
  onStatusChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | TaskStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on status and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter = activeFilter === 'All' ? true : task.status === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Control Bar: Title, Search, Filter Tabs & Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or details..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh tasks"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 pl-1 pr-2 text-xs font-medium">
          <Filter size={13} />
          <span>Filter:</span>
        </span>
        {(['All', 'Planned', 'In Progress', 'Complete'] as const).map((status) => {
          const count =
            status === 'All' ? tasks.length : tasks.filter((t) => t.status === status).length;
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{status}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load tasks</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-5 bg-slate-200 rounded-full w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-4/5" />
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="h-3 bg-slate-200 rounded w-24" />
                <div className="h-6 bg-slate-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State: No tasks at all */}
      {!isLoading && !error && tasks.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No tasks yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Get started by creating your first task. Track its progress through Planned, In Progress, and Complete states.
          </p>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Create your first task</span>
          </button>
        </div>
      )}

      {/* Empty State: Search/filter returned 0 results */}
      {!isLoading && !error && tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Search size={24} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700">No matching tasks found</p>
          <p className="text-xs text-slate-500 mt-1">
            No tasks match the filter &ldquo;{activeFilter}&rdquo; {searchQuery ? `or query &ldquo;${searchQuery}&rdquo;` : ''}.
          </p>
          <button
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Task Cards Grid */}
      {!isLoading && filteredTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
