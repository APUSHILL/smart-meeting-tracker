import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../services/task.service';
import { TaskPriority } from '../../models/task.model';
import { AiAnalysis } from '../../models/ai-analysis.model';
import { forkJoin } from 'rxjs';

export interface AiDialogData {
  meetingId: number;
  analysis: AiAnalysis;
}

interface SuggestedTask {
  title: string;
  priority: TaskPriority;
  selected: boolean;
}

@Component({
  selector: 'app-ai-suggestions-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatCheckboxModule,
    MatDividerModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule
  ],
  templateUrl: './ai-suggestions-dialog.component.html',
  styleUrl: './ai-suggestions-dialog.component.css'
})
export class AiSuggestionsDialogComponent {
  tasks: SuggestedTask[];
  priorities: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
  adding = false;

  constructor(
    public dialogRef: MatDialogRef<AiSuggestionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AiDialogData,
    private taskService: TaskService
  ) {
    this.tasks = data.analysis.suggestedTasks.map(title => ({
      title,
      priority: 'MEDIUM',
      selected: true
    }));
  }

  addSelected(): void {
    const toCreate = this.tasks
      .filter(t => t.selected && t.title.trim())
      .map(t => this.taskService.create({
        meetingId: this.data.meetingId,
        title: t.title.trim(),
        priority: t.priority
      }));

    if (toCreate.length === 0) { this.dialogRef.close([]); return; }

    this.adding = true;
    forkJoin(toCreate).subscribe({
      next: createdTasks => this.dialogRef.close(createdTasks),
      error: () => this.dialogRef.close([])
    });
  }
}
