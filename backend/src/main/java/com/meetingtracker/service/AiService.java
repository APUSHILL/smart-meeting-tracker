package com.meetingtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetingtracker.dto.AiAnalysisResponse;
import com.meetingtracker.entity.Meeting;
import com.meetingtracker.entity.Note;
import com.meetingtracker.exception.ResourceNotFoundException;
import com.meetingtracker.repository.MeetingRepository;
import com.meetingtracker.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final MeetingRepository meetingRepository;
    private final NoteRepository noteRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public AiService(MeetingRepository meetingRepository, NoteRepository noteRepository) {
        this.meetingRepository = meetingRepository;
        this.noteRepository = noteRepository;
        this.webClient = WebClient.create("https://generativelanguage.googleapis.com");
        this.objectMapper = new ObjectMapper();
    }

    public AiAnalysisResponse analyzeMeeting(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + meetingId));

        List<Note> notes = noteRepository.findByMeetingId(meetingId);

        String prompt = buildPrompt(meeting, notes);

        String geminiResponse = callGeminiApi(prompt);
        return parseResponse(geminiResponse);
    }

    private String buildPrompt(Meeting meeting, List<Note> notes) {
        StringBuilder sb = new StringBuilder();
        sb.append("Meeting: ").append(meeting.getTitle()).append("\n");
        if (meeting.getDescription() != null && !meeting.getDescription().isBlank()) {
            sb.append("Description: ").append(meeting.getDescription()).append("\n");
        }
        sb.append("Notes:\n");
        if (notes.isEmpty()) {
            sb.append("(no notes)\n");
        } else {
            for (Note note : notes) {
                sb.append("- ").append(note.getContent()).append("\n");
            }
        }
        sb.append("\n");
        sb.append("1. Write a 2-3 sentence summary of this meeting.\n");
        sb.append("2. List up to 5 concrete action item task titles (short, imperative, no explanation).\n");
        sb.append("Return ONLY valid JSON in this exact format, no markdown, no code blocks:\n");
        sb.append("{\"summary\": \"...\", \"suggestedTasks\": [\"...\", \"...\"]}");
        return sb.toString();
    }

    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );

        String url = "/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        try {
            return webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Gemini API error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    private AiAnalysisResponse parseResponse(String geminiResponse) {
        try {
            JsonNode root = objectMapper.readTree(geminiResponse);
            String text = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            // Strip markdown code fences if Gemini wraps response in ```json ... ```
            text = text.trim();
            if (text.startsWith("```")) {
                text = text.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }

            JsonNode parsed = objectMapper.readTree(text);
            String summary = parsed.path("summary").asText("Unable to generate summary.");

            List<String> tasks = new ArrayList<>();
            JsonNode tasksNode = parsed.path("suggestedTasks");
            if (tasksNode.isArray()) {
                for (JsonNode taskNode : tasksNode) {
                    tasks.add(taskNode.asText());
                }
            }
            return new AiAnalysisResponse(summary, tasks);
        } catch (Exception e) {
            return new AiAnalysisResponse("Could not parse AI response.", List.of());
        }
    }
}
