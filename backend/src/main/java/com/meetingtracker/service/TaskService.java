package com.meetingtracker.service;

import com.meetingtracker.dto.TaskRequest;
import com.meetingtracker.dto.TaskResponse;
import com.meetingtracker.entity.Meeting;
import com.meetingtracker.entity.Task;
import com.meetingtracker.entity.TaskStatus;
import com.meetingtracker.exception.ResourceNotFoundException;
import com.meetingtracker.repository.MeetingRepository;
import com.meetingtracker.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;

    public TaskService(TaskRepository taskRepository, MeetingRepository meetingRepository) {
        this.taskRepository = taskRepository;
        this.meetingRepository = meetingRepository;
    }

    public TaskResponse createTask(TaskRequest request) {
        Meeting meeting = meetingRepository.findById(request.getMeetingId())
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + request.getMeetingId()));

        Task task = new Task();
        task.setMeeting(meeting);
        task.setTitle(request.getTitle());
        task.setDeadline(request.getDeadline());
        task.setPriority(request.getPriority() != null ? request.getPriority() : com.meetingtracker.entity.TaskPriority.MEDIUM);
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setTitle(request.getTitle());
        task.setDeadline(request.getDeadline());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse markCompleted(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        task.setStatus(TaskStatus.COMPLETED);
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse markPending(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        task.setStatus(TaskStatus.PENDING);
        return toResponse(taskRepository.save(task));
    }

    public List<TaskResponse> getTasksByMeeting(Long meetingId) {
        if (!meetingRepository.existsById(meetingId)) {
            throw new ResourceNotFoundException("Meeting not found with id: " + meetingId);
        }
        return taskRepository.findByMeetingId(meetingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getOverdueTasks() {
        return taskRepository.findByDeadlineBeforeAndStatus(LocalDate.now(), TaskStatus.PENDING).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTodaysTasks() {
        return taskRepository.findByDeadline(LocalDate.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long countByStatus(TaskStatus status) {
        return taskRepository.countByStatus(status);
    }

    public long countOverdue() {
        return taskRepository.countByDeadlineBeforeAndStatus(LocalDate.now(), TaskStatus.PENDING);
    }

    private TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setMeetingId(task.getMeeting().getId());
        response.setMeetingTitle(task.getMeeting().getTitle());
        response.setTitle(task.getTitle());
        response.setDeadline(task.getDeadline());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setCreatedAt(task.getCreatedAt());
        return response;
    }
}
