'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreateTaskInput } from '@/types/task';
import { X, Loader2, PlusCircle, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => Promise<boolean>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setTitleError(null);
      setSubmitError(null);
      setIsSubmitting(false);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError('Task title is mandatory and cannot be blank.');
      titleInputRef.current?.focus();
      return;
    }

    setTitleError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const success = await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        status: 'Planned',
      });

      if (success) {
        setTitle('');
        setDescription('');
        onClose();
      } else {
        setSubmitError('Failed to create task. Please check your connection and try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-semibold text-slate-900">
                Create New Task
              </h3>
              <p className="text-xs text-slate-500">Add a task to your personal workspace</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification if submit failed */}
        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-medium text-slate-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              required
              disabled={isSubmitting}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g., Update customer onboarding workflow"
              className={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                titleError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
              }`}
            />
            {titleError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{titleError}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-medium text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              disabled={isSubmitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background, steps, or acceptance criteria..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Initial Status info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
            <span>Initial Status</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              Planned (Default)
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
