package com.meetingtracker.service;

import com.meetingtracker.dto.MeetingRequest;
import com.meetingtracker.dto.MeetingResponse;
import com.meetingtracker.entity.Meeting;
import com.meetingtracker.exception.ResourceNotFoundException;
import com.meetingtracker.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    public MeetingResponse createMeeting(MeetingRequest request) {
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setMeetingTime(request.getMeetingTime());
        meeting.setAttendees(toCommaSeparated(request.getAttendees()));
        return toResponse(meetingRepository.save(meeting));
    }

    public List<MeetingResponse> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MeetingResponse getMeetingById(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));
        return toResponse(meeting);
    }

    public MeetingResponse updateMeeting(Long id, MeetingRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + id));
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setMeetingTime(request.getMeetingTime());
        meeting.setAttendees(toCommaSeparated(request.getAttendees()));
        return toResponse(meetingRepository.save(meeting));
    }

    public void deleteMeeting(Long id) {
        if (!meetingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Meeting not found with id: " + id);
        }
        meetingRepository.deleteById(id);
    }

    public long countMeetings() {
        return meetingRepository.count();
    }

    private String toCommaSeparated(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        return list.stream().map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.joining(","));
    }

    private List<String> fromCommaSeparated(String value) {
        if (value == null || value.isBlank()) return Collections.emptyList();
        return Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    public MeetingResponse toResponse(Meeting meeting) {
        MeetingResponse response = new MeetingResponse();
        response.setId(meeting.getId());
        response.setTitle(meeting.getTitle());
        response.setDescription(meeting.getDescription());
        response.setMeetingTime(meeting.getMeetingTime());
        response.setCreatedAt(meeting.getCreatedAt());
        response.setTaskCount(meeting.getTasks().size());
        response.setNoteCount(meeting.getNotes().size());
        response.setAttendees(fromCommaSeparated(meeting.getAttendees()));
        return response;
    }
}
