import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private url = `${environment.apiBaseUrl}/meetings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(this.url);
  }

  getById(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.url}/${id}`);
  }

  create(meeting: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(this.url, meeting);
  }

  update(id: number, meeting: Meeting): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.url}/${id}`, meeting);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
