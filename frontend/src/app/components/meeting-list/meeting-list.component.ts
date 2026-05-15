import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MeetingService } from '../../services/meeting.service';
import { AiService } from '../../services/ai.service';
import { Meeting } from '../../models/meeting.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type DateFilter = 'all' | 'this-week' | 'this-month';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule
  ],
  templateUrl: './meeting-list.component.html',
  styleUrl: './meeting-list.component.css'
})
export class MeetingListComponent implements OnInit, OnDestroy {
  allMeetings: Meeting[] = [];
  aiSearchResults: Meeting[] | null = null;
  loading = true;
  isSearching = false;
  searchQuery = '';
  dateFilter: DateFilter = 'all';

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  constructor(
    private meetingService: MeetingService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
    this.searchSub = this.searchSubject.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim().length > 1) {
        this.runAiSearch(query);
      } else {
        this.aiSearchResults = null;
        this.isSearching = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(query: string): void {
    if (!query.trim()) {
      this.aiSearchResults = null;
      this.isSearching = false;
      this.searchSubject.next('');
      return;
    }
    this.isSearching = true;
    this.searchSubject.next(query);
  }

  private runAiSearch(query: string): void {
    this.aiService.smartSearch(query).subscribe({
      next: results => {
        this.aiSearchResults = results;
        this.isSearching = false;
      },
      error: () => {
        this.aiSearchResults = null;
        this.isSearching = false;
        this.snackBar.open('AI search failed, showing all meetings', 'Close', { duration: 3000 });
      }
    });
  }

  loadMeetings(): void {
    this.loading = true;
    this.meetingService.getAll().subscribe({
      next: data => { this.allMeetings = data; this.loading = false; },
      error: () => { this.snackBar.open('Failed to load meetings', 'Close', { duration: 3000 }); this.loading = false; }
    });
  }

  get filteredMeetings(): Meeting[] {
    const base = this.aiSearchResults !== null ? this.aiSearchResults : this.allMeetings;
    const now = new Date();

    return base.filter(m => {
      if (this.dateFilter !== 'all' && m.meetingTime) {
        const mt = new Date(m.meetingTime);
        if (this.dateFilter === 'this-week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          if (mt < startOfWeek || mt > endOfWeek) return false;
        } else if (this.dateFilter === 'this-month') {
          if (mt.getMonth() !== now.getMonth() || mt.getFullYear() !== now.getFullYear()) return false;
        }
      } else if (this.dateFilter !== 'all' && !m.meetingTime) {
        return false;
      }
      return true;
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.aiSearchResults = null;
    this.isSearching = false;
    this.searchSubject.next('');
  }

  deleteMeeting(id: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Delete this meeting and all its tasks/notes?')) return;
    this.meetingService.delete(id).subscribe({
      next: () => {
        this.allMeetings = this.allMeetings.filter(m => m.id !== id);
        if (this.aiSearchResults) this.aiSearchResults = this.aiSearchResults.filter(m => m.id !== id);
      },
      error: () => this.snackBar.open('Failed to delete meeting', 'Close', { duration: 3000 })
    });
  }

  isUpcoming(meeting: Meeting): boolean {
    if (!meeting.meetingTime) return false;
    return new Date(meeting.meetingTime) >= new Date();
  }
}
