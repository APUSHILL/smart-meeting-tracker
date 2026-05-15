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
      <mat-toolbar style="
        background: linear-gradient(to right, #1a8fb5, #14d4f0);
        color: white;
        border-bottom: 1px solid rgba(20,212,240,0.3);
      ">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:32px;height:32px;background:rgba(255,255,255,0.18);border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.25)">
            <mat-icon style="color:white;font-size:18px;width:18px;height:18px">event_note</mat-icon>
          </div>
          <span style="font-weight:700;letter-spacing:0.3px;color:white;font-size:1rem;">Smart Meeting Tracker</span>
        </div>
        <span style="flex:1"></span>
        <a mat-button routerLink="/dashboard" routerLinkActive="active-link" style="color:white;font-weight:600">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>
        <a mat-button routerLink="/meetings" routerLinkActive="active-link" style="color:white;font-weight:600">
          <mat-icon>meeting_room</mat-icon> Meetings
        </a>
        <div style="display:flex;align-items:center;gap:4px;margin-left:16px;background:rgba(255,255,255,0.18);border-radius:20px;padding:4px 12px 4px 8px;border:1px solid rgba(255,255,255,0.35)">
          <mat-icon style="color:white;font-size:16px;width:16px;height:16px">person</mat-icon>
          <span style="color:white;font-size:13px;font-weight:600">{{ authService.getUsername() }}</span>
        </div>
        <button mat-icon-button (click)="logout()" title="Logout" style="color:white;margin-left:4px">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
    }
    <main style="padding: 28px 32px; max-width: 1200px; margin: 0 auto;">
      <router-outlet />
    </main>
  `,
  styles: [`
    .active-link { background: rgba(255,255,255,0.2) !important; border-radius: 6px; }
    mat-toolbar { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 16px rgba(26,107,138,0.4); }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
  }
}
