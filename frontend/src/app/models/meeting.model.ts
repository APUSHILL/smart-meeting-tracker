export interface Meeting {
  id?: number;
  title: string;
  description?: string;
  meetingTime?: string;
  createdAt?: string;
  taskCount?: number;
  noteCount?: number;
  attendees?: string[];
}
