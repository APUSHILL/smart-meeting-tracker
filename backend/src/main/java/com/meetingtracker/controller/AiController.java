package com.meetingtracker.controller;

import com.meetingtracker.dto.AiAnalysisResponse;
import com.meetingtracker.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze/{meetingId}")
    public ResponseEntity<AiAnalysisResponse> analyzeMeeting(@PathVariable Long meetingId) {
        return ResponseEntity.ok(aiService.analyzeMeeting(meetingId));
    }
}
