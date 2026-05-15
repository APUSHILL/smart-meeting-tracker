package com.meetingtracker.controller;

import com.meetingtracker.dto.MeetingRequest;
import com.meetingtracker.dto.MeetingResponse;
import com.meetingtracker.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(
            @Valid @RequestBody MeetingRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(meetingService.createMeeting(request, user.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(meetingService.getAllMeetings(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeetingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(meetingService.getMeetingById(id, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingResponse> updateMeeting(
            @PathVariable Long id,
            @Valid @RequestBody MeetingRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(meetingService.updateMeeting(id, request, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        meetingService.deleteMeeting(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
