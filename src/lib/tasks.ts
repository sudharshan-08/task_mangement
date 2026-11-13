import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CreateTaskInput, Task, TaskStatus } from '@/types/task';

const DEMO_TASKS_STORAGE_KEY = 'taskflow_demo_tasks';

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    user_id: 'demo-user-1111-2222-3333-444444444444',
    title: 'Design high-converting SaaS landing page',
    description: 'Create responsive wireframes and layout for TaskFlow hero, feature section, and authentication flow.',
    status: 'Complete',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-task-2',
    user_id: 'demo-user-1111-2222-3333-444444444444',
    title: 'Implement Google OAuth with Supabase Auth',
    description: 'Configure OAuth consent screen, client credentials, and callback handlers for secure user sessions.',
    status: 'In Progress',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'demo-task-3',
    user_id: 'demo-user-1111-2222-3333-444444444444',
    title: 'Configure Row Level Security (RLS) on PostgreSQL',
    description: 'Ensure all tasks are restricted so users can strictly view, insert, and update only their own rows.',
    status: 'Planned',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

function isDemoSession(userId: string): boolean {
  return !userId || userId.startsWith('demo-') || !isSupabaseConfigured();
}

function getDemoTasks(userId: string): Task[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DEMO_TASKS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(DEMO_TASKS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
    return INITIAL_DEMO_TASKS;
  }
  try {
    const parsed = JSON.parse(stored) as Task[];
    return parsed.filter((t) => t.user_id === userId);
  } catch {
    return INITIAL_DEMO_TASKS;
  }
}

function saveDemoTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export async function fetchTasks(userId: string): Promise<{ data: Task[]; error?: string }> {
  if (!userId) {
    return { data: [], error: 'User ID is required to fetch tasks.' };
  }

  if (isDemoSession(userId)) {
    const tasks = getDemoTasks(userId);
    return { data: tasks };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchTasks error:', error);
      return { data: [], error: error.message };
    }

    return { data: (data as Task[]) || [] };
  } catch (err: any) {
    console.error('Unexpected fetchTasks error:', err);
    return { data: [], error: err.message || 'Failed to fetch tasks from database.' };
  }
}

export async function createTask(
  input: CreateTaskInput,
  userId: string
): Promise<{ data: Task | null; error?: string }> {
  const trimmedTitle = input.title?.trim();
  if (!trimmedTitle) {
    return { data: null, error: 'Task title is mandatory and cannot be empty.' };
  }

  const status: TaskStatus = input.status || 'Planned';
  if (!['Planned', 'In Progress', 'Complete'].includes(status)) {
    return { data: null, error: 'Invalid task status. Must be Planned, In Progress, or Complete.' };
  }

  if (!userId) {
    return { data: null, error: 'Authenticated user session is required.' };
  }

  if (isDemoSession(userId)) {
    const stored = localStorage.getItem(DEMO_TASKS_STORAGE_KEY);
    let allTasks: Task[] = [];
    try {
      allTasks = stored ? JSON.parse(stored) : INITIAL_DEMO_TASKS;
    } catch {
      allTasks = INITIAL_DEMO_TASKS;
    }

    const newTask: Task = {
      id: 'demo-task-' + Date.now(),
      user_id: userId,
      title: trimmedTitle,
      description: input.description?.trim() || null,
      status: 'Planned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allTasks.unshift(newTask);
    saveDemoTasks(allTasks);
    return { data: newTask };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: trimmedTitle,
        description: input.description?.trim() || null,
        status: 'Planned',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createTask error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Task };
  } catch (err: any) {
    console.error('Unexpected createTask error:', err);
    return { data: null, error: err.message || 'Failed to insert task into database.' };
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (!['Planned', 'In Progress', 'Complete'].includes(newStatus)) {
    return { success: false, error: 'Invalid status. Permitted values: Planned, In Progress, Complete.' };
  }

  if (!taskId || !userId) {
    return { success: false, error: 'Task ID and User ID are required.' };
  }

  if (isDemoSession(userId)) {
    const stored = localStorage.getItem(DEMO_TASKS_STORAGE_KEY);
    let allTasks: Task[] = [];
    try {
      allTasks = stored ? JSON.parse(stored) : INITIAL_DEMO_TASKS;
    } catch {
      allTasks = INITIAL_DEMO_TASKS;
    }

    const taskIndex = allTasks.findIndex((t) => t.id === taskId && t.user_id === userId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found or unauthorized.' };
    }

    allTasks[taskIndex].status = newStatus;
    allTasks[taskIndex].updated_at = new Date().toISOString();
    saveDemoTasks(allTasks);
    return { success: true };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase updateTaskStatus error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected updateTaskStatus error:', err);
    return { success: false, error: err.message || 'Failed to update task status in database.' };
  }
}
