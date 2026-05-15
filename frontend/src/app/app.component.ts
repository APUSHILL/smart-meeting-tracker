import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    @if (authService.isLoggedIn()) {
      <mat-toolbar color="primary" style="background: #1e2a3a; color: #e8edf3;">
        <mat-icon>event_note</mat-icon>
        <span style="margin-left:8px; font-weight:600; letter-spacing:0.3px;">Smart Meeting Tracker</span>
        <span style="flex:1"></span>
        <a mat-button routerLink="/dashboard" routerLinkActive="active-link" style="color:#e8edf3">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-button routerLink="/meetings" routerLinkActive="active-link" style="color:#e8edf3">
          <mat-icon>meeting_room</mat-icon> Meetings
        </a>
        <span style="margin-left:12px; color:#94a3b8; font-size:13px;">{{ authService.getUsername() }}</span>
        <button mat-icon-button (click)="logout()" title="Logout" style="color:#e8edf3; margin-left:8px">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
    }
    <main style="padding: 28px 32px; max-width: 1200px; margin: 0 auto;">
      <router-outlet />
    </main>
  `,
  styles: [`
    .active-link { background: rgba(255,255,255,0.12); border-radius: 6px; }
    mat-toolbar { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
  }
}
