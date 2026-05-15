import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AiAnalysis } from '../models/ai-analysis.model';
import { Meeting } from '../models/meeting.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  constructor(private http: HttpClient) {}

  analyzeMeeting(meetingId: number): Observable<AiAnalysis> {
    return this.http.post<AiAnalysis>(`${environment.apiBaseUrl}/ai/analyze/${meetingId}`, {});
  }

  smartSearch(query: string): Observable<Meeting[]> {
    return this.http.post<Meeting[]>(`${environment.apiBaseUrl}/search`, { query });
  }
}
