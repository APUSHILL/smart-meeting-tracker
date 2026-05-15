package com.meetingtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NoteRequest {

    @NotNull(message = "Meeting ID is required")
    private Long meetingId;

    @NotBlank(message = "Content is required")
    private String content;

    public Long getMeetingId() { return meetingId; }
    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
