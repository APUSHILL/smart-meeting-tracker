import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/dashboard.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  get(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.url);
  }
}
