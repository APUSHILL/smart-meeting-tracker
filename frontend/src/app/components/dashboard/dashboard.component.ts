import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
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
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule,
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
    datasets: [{ data: [0, 0, 0], label: 'Tasks', backgroundColor: ['#3f51b5', '#4caf50', '#f44336'] }]
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  pieChartData: ChartData<'pie'> = {
    labels: ['Pending', 'Completed'],
    datasets: [{ data: [0, 0], backgroundColor: ['#ff9800', '#4caf50'] }]
  };
  pieChartOptions: ChartOptions<'pie'> = { responsive: true };

  constructor(
    private dashboardService: DashboardService,
    private taskService: TaskService
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

    this.taskService.getToday().subscribe(tasks => this.todayTasks = tasks);
    this.taskService.getOverdue().subscribe(tasks => this.overdueTasks = tasks);
  }
}
