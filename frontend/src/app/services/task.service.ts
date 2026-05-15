import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private url = `${environment.apiBaseUrl}/tasks`;

  constructor(private http: HttpClient) {}

  create(task: Task): Observable<Task> {
    return this.http.post<Task>(this.url, task);
  }

  update(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, task);
  }

  markCompleted(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/complete`, {});
  }

  markPending(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/pending`, {});
  }

  getByMeeting(meetingId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.url}/meeting/${meetingId}`);
  }

  getByStatus(status: 'PENDING' | 'COMPLETED'): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.url}/status/${status}`);
  }

  getOverdue(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.url}/overdue`);
  }

  getToday(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.url}/today`);
  }
}
