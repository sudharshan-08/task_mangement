export type TaskStatus = 'Planned' | 'In Progress' | 'Complete';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskStatusInput {
  id: string;
  status: TaskStatus;
}

export interface TaskSummaryCounts {
  planned: number;
  inProgress: number;
  complete: number;
  total: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}
