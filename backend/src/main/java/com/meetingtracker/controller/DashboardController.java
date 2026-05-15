package com.meetingtracker.controller;

import com.meetingtracker.dto.DashboardResponse;
import com.meetingtracker.entity.TaskStatus;
import com.meetingtracker.service.MeetingService;
import com.meetingtracker.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MeetingService meetingService;
    private final TaskService taskService;

    public DashboardController(MeetingService meetingService, TaskService taskService) {
        this.meetingService = meetingService;
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        long totalMeetings = meetingService.countMeetings();
        long pendingTasks = taskService.countByStatus(TaskStatus.PENDING);
        long completedTasks = taskService.countByStatus(TaskStatus.COMPLETED);
        long overdueTasks = taskService.countOverdue();
        return ResponseEntity.ok(new DashboardResponse(totalMeetings, pendingTasks, completedTasks, overdueTasks));
    }
}
