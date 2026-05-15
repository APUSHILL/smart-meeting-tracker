export type TaskStatus = 'PENDING' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id?: number;
  meetingId: number;
  meetingTitle?: string;
  title: string;
  deadline?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdAt?: string;
}
