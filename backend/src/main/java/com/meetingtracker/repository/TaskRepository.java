package com.meetingtracker.repository;

import com.meetingtracker.entity.Task;
import com.meetingtracker.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByMeetingId(Long meetingId);

    List<Task> findByDeadlineBeforeAndStatus(LocalDate date, TaskStatus status);

    List<Task> findByDeadline(LocalDate date);

    List<Task> findByStatus(TaskStatus status);

    long countByStatus(TaskStatus status);

    long countByDeadlineBeforeAndStatus(LocalDate date, TaskStatus status);

    // ── Per-user versions (join through meeting.createdBy) ──

    @Query("SELECT t FROM Task t WHERE t.meeting.createdBy = :username AND t.status = :status")
    List<Task> findByMeetingCreatedByAndStatus(@Param("username") String username, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.meeting.createdBy = :username AND t.status = :status")
    long countByMeetingCreatedByAndStatus(@Param("username") String username, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.meeting.createdBy = :username AND t.deadline < :date AND t.status = :status")
    long countByMeetingCreatedByAndDeadlineBeforeAndStatus(@Param("username") String username, @Param("date") LocalDate date, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.meeting.createdBy = :username AND t.deadline = :date")
    List<Task> findByMeetingCreatedByAndDeadline(@Param("username") String username, @Param("date") LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.meeting.createdBy = :username AND t.deadline < :date AND t.status = :status")
    List<Task> findByMeetingCreatedByAndDeadlineBeforeAndStatus(@Param("username") String username, @Param("date") LocalDate date, @Param("status") TaskStatus status);
}
