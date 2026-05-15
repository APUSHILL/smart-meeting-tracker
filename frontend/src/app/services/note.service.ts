import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../models/note.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private url = `${environment.apiBaseUrl}/notes`;

  constructor(private http: HttpClient) {}

  create(note: Note): Observable<Note> {
    return this.http.post<Note>(this.url, note);
  }

  getByMeeting(meetingId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.url}/meeting/${meetingId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
