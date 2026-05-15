import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart, ChartData, ChartOptions,
  BarController, BarElement, CategoryScale, LinearScale,
  PieController, ArcElement,
  Tooltip, Legend
} from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { TaskService } from '../../services/task.service';
import { Dashboard } from '../../models/dashboard.model';
import { Task } from '../../models/task.model';
import { TaskListDialogComponent, TaskListDialogData } from './task-list-dialog.component';
Chart.register(
  BarController, BarElement, CategoryScale, LinearScale,
  PieController, ArcElement,
  Tooltip, Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatDialogModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats: Dashboard = { totalMeetings: 0, pendingTasks: 0, completedTasks: 0, overdueTasks: 0 };
  todayTasks: Task[] = [];
  overdueTasks: Task[] = [];

  barChartData: ChartData<'bar'> = {
    labels: ['Pending', 'Completed', 'Overdue'],
    datasets: [{ data: [0, 0, 0], label: 'Tasks', backgroundColor: ['#6366f1', '#22c55e', '#ef4444'] }]
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  pieChartData: ChartData<'pie'> = {
    labels: ['Pending', 'Completed'],
    datasets: [{ data: [0, 0], backgroundColor: ['#6366f1', '#22c55e'] }]
  };
  pieChartOptions: ChartOptions<'pie'> = { responsive: true };

  constructor(
    private dashboardService: DashboardService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dashboardService.get().subscribe(data => {
      this.stats = data;
      this.barChartData = {
        ...this.barChartData,
        datasets: [{ ...this.barChartData.datasets[0], data: [data.pendingTasks, data.completedTasks, data.overdueTasks] }]
      };
      this.pieChartData = {
        ...this.pieChartData,
        datasets: [{ ...this.pieChartData.datasets[0], data: [data.pendingTasks, data.completedTasks] }]
      };
    });

    this.taskService.getToday().subscribe({ next: t => this.todayTasks = t, error: () => {} });
    this.taskService.getOverdue().subscribe({ next: t => this.overdueTasks = t, error: () => {} });
  }

  openPendingTasks(): void {
    this.taskService.getByStatus('PENDING').subscribe({
      next: tasks => this.openDialog({ title: 'Pending Tasks', icon: 'pending_actions', iconColor: '#d97706', tasks }),
      error: () => this.openDialog({ title: 'Pending Tasks', icon: 'pending_actions', iconColor: '#d97706', tasks: [] })
    });
  }

  openCompletedTasks(): void {
    this.taskService.getByStatus('COMPLETED').subscribe({
      next: tasks => this.openDialog({ title: 'Completed Tasks', icon: 'task_alt', iconColor: '#16a34a', tasks }),
      error: () => this.openDialog({ title: 'Completed Tasks', icon: 'task_alt', iconColor: '#16a34a', tasks: [] })
    });
  }

  openOverdueTasks(): void {
    this.taskService.getOverdue().subscribe({
      next: tasks => this.openDialog({ title: 'Overdue Tasks', icon: 'warning', iconColor: '#dc2626', tasks }),
      error: () => this.openDialog({ title: 'Overdue Tasks', icon: 'warning', iconColor: '#dc2626', tasks: [] })
    });
  }

  goToMeetings(): void {
    this.router.navigate(['/meetings']);
  }

  private openDialog(data: TaskListDialogData): void {
    this.dialog.open(TaskListDialogComponent, {
      data,
      width: '480px',
      maxHeight: '90vh'
    });
  }
}
