import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../models/task.model';

export interface TaskListDialogData {
  title: string;
  icon: string;
  iconColor: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-list-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-header" [style.--accent]="data.iconColor">
      <div class="dialog-icon">
        <mat-icon [style.color]="data.iconColor">{{ data.icon }}</mat-icon>
      </div>
      <div>
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <p class="dialog-subtitle">{{ data.tasks.length }} task{{ data.tasks.length === 1 ? '' : 's' }}</p>
      </div>
      <button mat-icon-button mat-dialog-close class="close-btn"><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      @if (data.tasks.length === 0) {
        <div class="empty">
          <mat-icon>check_circle</mat-icon>
          <p>No tasks here!</p>
        </div>
      }
      @for (task of data.tasks; track task.id) {
        <div class="task-item" (click)="goToMeeting(task)">
          <div class="task-left">
            <span class="priority-dot" [class]="'dot-' + (task.priority ?? 'MEDIUM').toLowerCase()"></span>
            <div class="task-text">
              <span class="task-title">{{ task.title }}</span>
              <span class="meeting-name">
                <mat-icon class="mini-icon">meeting_room</mat-icon>
                {{ task.meetingTitle ?? 'Meeting #' + task.meetingId }}
              </span>
            </div>
          </div>
          <div class="task-right">
            @if (task.deadline) {
              <span class="deadline">{{ task.deadline | date:'MMM d' }}</span>
            }
            <mat-icon class="go-icon">arrow_forward_ios</mat-icon>
          </div>
        </div>
      }
    </mat-dialog-content>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }
    .dialog-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: #f8f9fb;
      border: 1px solid #e8edf5;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .dialog-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    h2[mat-dialog-title] { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; padding: 0; }
    .dialog-subtitle { margin: 2px 0 0; font-size: 0.8rem; color: #94a3b8; }
    .close-btn { margin-left: auto; color: #94a3b8; }

    .dialog-content { padding: 8px 0 4px !important; max-height: 420px; overflow-y: auto; }

    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid #f8f9fb;
    }
    .task-item:last-child { border-bottom: none; }
    .task-item:hover { background: #f8f9fb; }

    .task-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .task-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }

    .priority-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .dot-high   { background: #ef4444; }
    .dot-medium { background: #f59e0b; }
    .dot-low    { background: #94a3b8; }

    .task-title {
      font-size: 0.88rem;
      font-weight: 500;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meeting-name {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.77rem; color: #94a3b8;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .mini-icon { font-size: 13px; width: 13px; height: 13px; }

    .task-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: 12px; }
    .deadline { font-size: 0.75rem; color: #64748b; font-weight: 500; }
    .go-icon { font-size: 14px; width: 14px; height: 14px; color: #c8d0de; }

    .empty {
      display: flex; flex-direction: column; align-items: center;
      padding: 32px 20px; color: #94a3b8; gap: 8px;
    }
    .empty mat-icon { font-size: 40px; width: 40px; height: 40px; color: #c8d0de; }
    .empty p { margin: 0; font-size: 0.88rem; }
  `]
})
export class TaskListDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TaskListDialogData,
    private dialogRef: MatDialogRef<TaskListDialogComponent>,
    private router: Router
  ) {}

  goToMeeting(task: Task): void {
    this.dialogRef.close();
    this.router.navigate(['/meetings', task.meetingId]);
  }
}
