import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MeetingService } from '../../services/meeting.service';
import { TaskService } from '../../services/task.service';
import { NoteService } from '../../services/note.service';
import { AiService } from '../../services/ai.service';
import { Meeting } from '../../models/meeting.model';
import { Task, TaskPriority } from '../../models/task.model';
import { Note } from '../../models/note.model';
import { forkJoin } from 'rxjs';
import { AiSuggestionsDialogComponent } from './ai-suggestions-dialog.component';

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatChipsModule, MatSelectModule, MatDividerModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.css'
})
export class MeetingDetailsComponent implements OnInit {
  @ViewChild('editAttendeeInput') editAttendeeInput!: ElementRef<HTMLInputElement>;

  meeting: Meeting | null = null;
  tasks: Task[] = [];
  notes: Note[] = [];
  loading = true;
  meetingId!: number;

  // Edit meeting state
  editMode = false;
  editForm!: FormGroup;
  editAttendees: string[] = [];
  saving = false;
  separatorKeysCodes = [ENTER, COMMA];

  // Add task / note
  taskForm: FormGroup;
  noteForm: FormGroup;
  addingTask = false;
  addingNote = false;
  isAnalyzing = false;

  // Inline attendee editing
  editingAttendees = false;
  editableAttendees: string[] = [];

  priorities: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private taskService: TaskService,
    private noteService: NoteService,
    private aiService: AiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      deadline: [null],
      priority: ['MEDIUM']
    });
    this.noteForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.meetingId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    forkJoin({
      meeting: this.meetingService.getById(this.meetingId),
      tasks: this.taskService.getByMeeting(this.meetingId),
      notes: this.noteService.getByMeeting(this.meetingId)
    }).subscribe({
      next: ({ meeting, tasks, notes }) => {
        this.meeting = meeting;
        this.tasks = tasks;
        this.notes = notes;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load meeting details', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  // ── Edit meeting ──────────────────────────────────────────────

  enterEditMode(): void {
    if (!this.meeting) return;
    const mt = this.meeting.meetingTime ? new Date(this.meeting.meetingTime) : null;
    this.editForm = this.fb.group({
      title: [this.meeting.title, [Validators.required, Validators.minLength(3)]],
      description: [this.meeting.description || ''],
      meetingDate: [mt],
      meetingTime: [mt ? mt.toTimeString().slice(0, 5) : '']
    });
    this.editAttendees = [...(this.meeting.attendees || [])];
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  addEditAttendee(value: string): void {
    const name = (value || '').trim();
    if (name && !this.editAttendees.includes(name)) this.editAttendees.push(name);
    if (this.editAttendeeInput) this.editAttendeeInput.nativeElement.value = '';
  }

  removeEditAttendee(name: string): void {
    this.editAttendees = this.editAttendees.filter(a => a !== name);
  }

  saveEdit(): void {
    if (this.editForm.invalid) return;
    this.saving = true;
    const { title, description, meetingDate, meetingTime } = this.editForm.value;
    let isoTime: string | undefined;
    if (meetingDate) {
      const d = new Date(meetingDate);
      if (meetingTime) { const [h, m] = meetingTime.split(':').map(Number); d.setHours(h, m, 0, 0); }
      isoTime = d.toISOString();
    }
    this.meetingService.update(this.meetingId, {
      title, description,
      meetingTime: isoTime,
      attendees: this.editAttendees
    } as Meeting).subscribe({
      next: updated => {
        this.meeting = updated;
        this.editMode = false;
        this.saving = false;
        this.snackBar.open('Meeting updated!', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to update meeting', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  get editTitleError(): string {
    const c = this.editForm?.get('title');
    if (c?.hasError('required')) return 'Title is required';
    if (c?.hasError('minlength')) return 'Min 3 characters';
    return '';
  }

  // ── Task helpers ──────────────────────────────────────────────

  isOverdue(task: Task): boolean {
    if (!task.deadline || task.status === 'COMPLETED') return false;
    return new Date(task.deadline) < new Date(new Date().toDateString());
  }

  isToday(task: Task): boolean {
    if (!task.deadline) return false;
    return new Date(task.deadline).toDateString() === new Date().toDateString();
  }

  isMeetingUpcoming(): boolean {
    if (!this.meeting?.meetingTime) return false;
    return new Date(this.meeting.meetingTime) >= new Date();
  }

  priorityLabel(p?: TaskPriority): string {
    return p ?? 'MEDIUM';
  }

  addTask(): void {
    if (this.taskForm.invalid) return;
    this.addingTask = true;
    const value = this.taskForm.value;
    const task: Task = {
      meetingId: this.meetingId,
      title: value.title,
      deadline: value.deadline ? value.deadline.toISOString().split('T')[0] : undefined,
      priority: value.priority || 'MEDIUM'
    };
    this.taskService.create(task).subscribe({
      next: newTask => {
        this.tasks.push(newTask);
        this.taskForm.reset({ priority: 'MEDIUM' });
        this.addingTask = false;
      },
      error: () => {
        this.snackBar.open('Failed to add task', 'Close', { duration: 3000 });
        this.addingTask = false;
      }
    });
  }

  markComplete(task: Task): void {
    this.taskService.markCompleted(task.id!).subscribe({
      next: updated => {
        const idx = this.tasks.findIndex(t => t.id === updated.id);
        if (idx !== -1) this.tasks[idx] = updated;
      },
      error: () => this.snackBar.open('Failed to update task', 'Close', { duration: 3000 })
    });
  }

  markPending(task: Task): void {
    this.taskService.markPending(task.id!).subscribe({
      next: updated => {
        const idx = this.tasks.findIndex(t => t.id === updated.id);
        if (idx !== -1) this.tasks[idx] = updated;
      },
      error: () => this.snackBar.open('Failed to undo task', 'Close', { duration: 3000 })
    });
  }

  addNote(): void {
    if (this.noteForm.invalid) return;
    this.addingNote = true;
    const note: Note = { meetingId: this.meetingId, content: this.noteForm.value.content };
    this.noteService.create(note).subscribe({
      next: newNote => {
        this.notes.unshift(newNote);
        this.noteForm.reset();
        this.addingNote = false;
      },
      error: () => {
        this.snackBar.open('Failed to add note', 'Close', { duration: 3000 });
        this.addingNote = false;
      }
    });
  }

  toggleAttendeeEdit(): void {
    if (!this.editingAttendees) {
      this.editableAttendees = [...(this.meeting?.attendees || [])];
      this.editingAttendees = true;
    } else {
      this.saveAttendees();
    }
  }

  addAttendee(value: string): void {
    const name = value.trim();
    if (name && !this.editableAttendees.includes(name)) {
      this.editableAttendees.push(name);
    }
  }

  removeAttendee(name: string): void {
    this.editableAttendees = this.editableAttendees.filter(a => a !== name);
  }

  private saveAttendees(): void {
    if (!this.meeting) return;
    this.meetingService.update(this.meetingId, {
      ...this.meeting,
      attendees: this.editableAttendees
    } as any).subscribe({
      next: updated => {
        this.meeting = updated;
        this.editingAttendees = false;
        this.snackBar.open('Attendees updated', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to update attendees', 'Close', { duration: 3000 })
    });
  }

  analyzeWithAi(): void {
    this.isAnalyzing = true;
    this.aiService.analyzeMeeting(this.meetingId).subscribe({
      next: analysis => {
        this.isAnalyzing = false;
        const ref = this.dialog.open(AiSuggestionsDialogComponent, {
          width: '520px',
          data: { meetingId: this.meetingId, analysis }
        });
        ref.afterClosed().subscribe((createdTasks: Task[]) => {
          if (createdTasks?.length) {
            this.tasks.push(...createdTasks);
            this.snackBar.open(`${createdTasks.length} task(s) added!`, 'Close', { duration: 2500 });
          }
        });
      },
      error: () => {
        this.isAnalyzing = false;
        this.snackBar.open('AI analysis failed. Check your API key and try again.', 'Close', { duration: 4000 });
      }
    });
  }

  deleteNote(id: number): void {
    this.noteService.delete(id).subscribe({
      next: () => this.notes = this.notes.filter(n => n.id !== id),
      error: () => this.snackBar.open('Failed to delete note', 'Close', { duration: 3000 })
    });
  }
}
