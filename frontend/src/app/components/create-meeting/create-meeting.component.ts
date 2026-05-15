import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MeetingService } from '../../services/meeting.service';

@Component({
  selector: 'app-create-meeting',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './create-meeting.component.html',
  styleUrl: './create-meeting.component.css'
})
export class CreateMeetingComponent {
  @ViewChild('attendeeInput') attendeeInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  saving = false;
  attendees: string[] = [];
  separatorKeysCodes = [ENTER, COMMA];

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      meetingDate: [null],
      meetingTime: ['']
    });
  }

  get titleError(): string {
    const ctrl = this.form.get('title');
    if (ctrl?.hasError('required')) return 'Title is required';
    if (ctrl?.hasError('minlength')) return 'Title must be at least 3 characters';
    return '';
  }

  addAttendee(value: string): void {
    const name = (value || '').trim();
    if (name && !this.attendees.includes(name)) {
      this.attendees.push(name);
    }
    if (this.attendeeInput) {
      this.attendeeInput.nativeElement.value = '';
    }
  }

  removeAttendee(name: string): void {
    this.attendees = this.attendees.filter(a => a !== name);
  }

  onAttendeeInputKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addAttendee(input.value);
    }
  }

  onAttendeeBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (input.value.trim()) {
      this.addAttendee(input.value);
    }
  }

  buildMeetingTime(): string | null {
    const date: Date | null = this.form.value.meetingDate;
    const time: string = this.form.value.meetingTime || '';
    if (!date) return null;
    const d = new Date(date);
    if (time) {
      const [h, m] = time.split(':').map(Number);
      d.setHours(h, m, 0, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.toISOString();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const meetingTime = this.buildMeetingTime();
    const payload = {
      title: this.form.value.title,
      description: this.form.value.description,
      meetingTime: meetingTime ?? undefined,
      attendees: this.attendees
    };
    this.meetingService.create(payload).subscribe({
      next: meeting => {
        this.snackBar.open('Meeting created!', 'Close', { duration: 2000 });
        this.router.navigate(['/meetings', meeting.id]);
      },
      error: () => {
        this.snackBar.open('Failed to create meeting', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }
}
