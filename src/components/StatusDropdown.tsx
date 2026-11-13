'use client';

import React, { useState } from 'react';
import { TaskStatus } from '@/types/task';
import { ChevronDown, Loader2 } from 'lucide-react';

interface StatusDropdownProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => Promise<void>;
  disabled?: boolean;
}

const STATUS_OPTIONS: { label: TaskStatus; description: string; dotColor: string }[] = [
  { label: 'Planned', description: 'Scheduled to start', dotColor: 'bg-slate-400' },
  { label: 'In Progress', description: 'Currently active', dotColor: 'bg-blue-500' },
  { label: 'Complete', description: 'Successfully finished', dotColor: 'bg-emerald-500' },
];

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (status: TaskStatus) => {
    if (status === currentStatus || isUpdating) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false);
    try {
      await onStatusChange(status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled || isUpdating}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all"
        title="Change task status"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {isUpdating ? (
          <>
            <Loader2 size={13} className="animate-spin text-indigo-600" />
            <span>Updating...</span>
          </>
        ) : (
          <>
            <span>Change status</span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Set Status
            </div>
            <div className="py-1" role="listbox">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = option.label === currentStatus;
                return (
                  <button
                    key={option.label}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.label)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-indigo-50/60 font-semibold text-indigo-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${option.dotColor}`} />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-indigo-600 font-medium">Current</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
