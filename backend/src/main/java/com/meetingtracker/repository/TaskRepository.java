package com.meetingtracker.repository;

import com.meetingtracker.entity.Task;
import com.meetingtracker.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByMeetingId(Long meetingId);

    // Overdue: deadline before today and still pending
    List<Task> findByDeadlineBeforeAndStatus(LocalDate date, TaskStatus status);

    // Today's tasks
    List<Task> findByDeadline(LocalDate date);

    long countByStatus(TaskStatus status);

    long countByDeadlineBeforeAndStatus(LocalDate date, TaskStatus status);
}
