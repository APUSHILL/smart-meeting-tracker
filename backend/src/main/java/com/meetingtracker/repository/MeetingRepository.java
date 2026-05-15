package com.meetingtracker.repository;

import com.meetingtracker.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    // Returns only meetings owned by this user
    List<Meeting> findByCreatedBy(String createdBy);

    // Find a specific meeting but only if it belongs to this user
    // — prevents user A from fetching user B's meeting by guessing its ID
    Optional<Meeting> findByIdAndCreatedBy(Long id, String createdBy);

    long countByCreatedBy(String createdBy);
}
