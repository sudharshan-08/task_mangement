'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, Task, TaskStatus, CreateTaskInput, TaskSummaryCounts } from '@/types/task';
import { getCurrentUser, signOut } from '@/lib/auth';
import { fetchTasks, createTask, updateTaskStatus } from '@/lib/tasks';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { TaskSummary } from '@/components/TaskSummary';
import { TaskList } from '@/components/TaskList';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { NotificationToast, ToastMessage } from '@/components/NotificationToast';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isDemo = user?.id?.startsWith('demo-user-') || !isSupabaseConfigured();

  // Toast notification helper
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load user session
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      setIsAuthLoading(true);
      const currentUser = await getCurrentUser();

      if (!isMounted) return;

      if (!currentUser) {
        router.replace('/login');
        return;
      }

      setUser(currentUser);
      setIsAuthLoading(false);
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Load user tasks
  const loadTasks = useCallback(async (userId: string) => {
    setIsTasksLoading(true);
    setTasksError(null);

    const result = await fetchTasks(userId);
    if (result.error) {
      setTasksError(result.error);
    } else {
      setTasks(result.data);
    }
    setIsTasksLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadTasks(user.id);
    }
  }, [user?.id, loadTasks]);

  // Compute dynamic task summary counts
  const summaryCounts: TaskSummaryCounts = useMemo(() => {
    const planned = tasks.filter((t) => t.status === 'Planned').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const complete = tasks.filter((t) => t.status === 'Complete').length;
    return {
      planned,
      inProgress,
      complete,
      total: tasks.length,
    };
  }, [tasks]);

  // Handle task creation
  const handleCreateTask = async (input: CreateTaskInput): Promise<boolean> => {
    if (!user) return false;

    const result = await createTask(input, user.id);
    if (result.error || !result.data) {
      addToast(result.error || 'Failed to create task.', 'error');
      return false;
    }

    // Prepend newly created task
    setTasks((prev) => [result.data!, ...prev]);
    addToast('Task created successfully!', 'success');
    return true;
  };

  // Handle status update
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    if (!user) return;

    // Save previous state for rollback in case of error
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    );

    const result = await updateTaskStatus(taskId, newStatus, user.id);

    if (!result.success) {
      // Rollback
      setTasks(previousTasks);
      addToast(result.error || 'Failed to update task status.', 'error');
    } else {
      addToast(`Status updated to "${newStatus}"`, 'success');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-xs font-medium text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} isDemo={isDemo} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your tasks, track active progress, and organize your daily objectives.
            </p>
          </div>
        </div>

        {/* Dynamic Task Overview Summary Cards */}
        <TaskSummary counts={summaryCounts} />

        {/* Task Management Section */}
        <div className="pt-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Your Tasks</h2>
            <p className="text-xs text-slate-500">Filter, search and update status in real time</p>
          </div>

          <TaskList
            tasks={tasks}
            isLoading={isTasksLoading}
            error={tasksError}
            onRefresh={() => user && loadTasks(user.id)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Floating Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
