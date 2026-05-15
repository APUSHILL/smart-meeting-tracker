import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'meetings',
    canActivate: [authGuard],
    loadComponent: () => import('./components/meeting-list/meeting-list.component').then(m => m.MeetingListComponent)
  },
  {
    path: 'meetings/new',
    canActivate: [authGuard],
    loadComponent: () => import('./components/create-meeting/create-meeting.component').then(m => m.CreateMeetingComponent)
  },
  {
    path: 'meetings/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/meeting-details/meeting-details.component').then(m => m.MeetingDetailsComponent)
  }
];
