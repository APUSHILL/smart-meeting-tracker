package com.meetingtracker.controller;

import com.meetingtracker.dto.TaskRequest;
import com.meetingtracker.dto.TaskResponse;
import com.meetingtracker.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id,
                                                    @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> markCompleted(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.markCompleted(id));
    }

    @PatchMapping("/{id}/pending")
    public ResponseEntity<TaskResponse> markPending(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.markPending(id));
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<TaskResponse>> getTasksByMeeting(@PathVariable Long meetingId) {
        return ResponseEntity.ok(taskService.getTasksByMeeting(meetingId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks() {
        return ResponseEntity.ok(taskService.getOverdueTasks());
    }

    @GetMapping("/today")
    public ResponseEntity<List<TaskResponse>> getTodaysTasks() {
        return ResponseEntity.ok(taskService.getTodaysTasks());
    }
}
