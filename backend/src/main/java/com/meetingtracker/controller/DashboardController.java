package com.meetingtracker.controller;

import com.meetingtracker.dto.DashboardResponse;
import com.meetingtracker.entity.TaskStatus;
import com.meetingtracker.service.MeetingService;
import com.meetingtracker.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal UserDetails user) {
        String username = user.getUsername();
        long totalMeetings   = meetingService.countMeetings(username);
        long pendingTasks    = taskService.countByStatus(TaskStatus.PENDING, username);
        long completedTasks  = taskService.countByStatus(TaskStatus.COMPLETED, username);
        long overdueTasks    = taskService.countOverdue(username);
        return ResponseEntity.ok(new DashboardResponse(totalMeetings, pendingTasks, completedTasks, overdueTasks));
    }
}
