package com.meetingtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetingtracker.dto.MeetingResponse;
import com.meetingtracker.entity.Meeting;
import com.meetingtracker.entity.Note;
import com.meetingtracker.repository.MeetingRepository;
import com.meetingtracker.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final MeetingRepository meetingRepository;
    private final NoteRepository noteRepository;
    private final MeetingService meetingService;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public SearchService(MeetingRepository meetingRepository, NoteRepository noteRepository,
                         MeetingService meetingService) {
        this.meetingRepository = meetingRepository;
        this.noteRepository = noteRepository;
        this.meetingService = meetingService;
        this.webClient = WebClient.create("https://generativelanguage.googleapis.com");
        this.objectMapper = new ObjectMapper();
    }

    public List<MeetingResponse> search(String query) {
        List<Meeting> allMeetings = meetingRepository.findAll();
        if (allMeetings.isEmpty()) return List.of();

        String meetingsJson = buildMeetingsJson(allMeetings);
        String prompt = buildPrompt(query, meetingsJson);
        String geminiResponse = callGeminiApi(prompt);

        if (geminiResponse == null) {
            log.warn("Gemini unavailable, falling back to keyword search for: {}", query);
            return keywordFallback(query, allMeetings);
        }

        List<Long> matchedIds = parseIds(geminiResponse);

        if (matchedIds == null) {
            log.warn("Gemini parse failed, falling back to keyword search for: {}", query);
            return keywordFallback(query, allMeetings);
        }

        if (matchedIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Meeting> meetingMap = allMeetings.stream()
                .collect(Collectors.toMap(Meeting::getId, m -> m));

        return matchedIds.stream()
                .filter(meetingMap::containsKey)
                .map(id -> meetingService.toResponse(meetingMap.get(id)))
                .collect(Collectors.toList());
    }

    private List<MeetingResponse> keywordFallback(String query, List<Meeting> meetings) {
        String q = query.toLowerCase();
        return meetings.stream()
                .filter(m -> {
                    if (m.getTitle() != null && m.getTitle().toLowerCase().contains(q)) return true;
                    if (m.getDescription() != null && m.getDescription().toLowerCase().contains(q)) return true;
                    if (m.getAttendees() != null && m.getAttendees().toLowerCase().contains(q)) return true;
                    List<Note> notes = noteRepository.findByMeetingId(m.getId());
                    return notes.stream().anyMatch(n -> n.getContent() != null && n.getContent().toLowerCase().contains(q));
                })
                .map(meetingService::toResponse)
                .collect(Collectors.toList());
    }

    private String buildMeetingsJson(List<Meeting> meetings) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < meetings.size(); i++) {
            Meeting m = meetings.get(i);
            List<Note> notes = noteRepository.findByMeetingId(m.getId());
            sb.append("{");
            sb.append("\"id\":").append(m.getId()).append(",");
            sb.append("\"title\":\"").append(escape(m.getTitle())).append("\",");
            sb.append("\"description\":\"").append(escape(m.getDescription())).append("\",");
            sb.append("\"notes\":[");
            for (int j = 0; j < notes.size(); j++) {
                sb.append("\"").append(escape(notes.get(j).getContent())).append("\"");
                if (j < notes.size() - 1) sb.append(",");
            }
            sb.append("]}");
            if (i < meetings.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private String buildPrompt(String query, String meetingsJson) {
        return "User query: \"" + query + "\"\n\n" +
               "Meetings data:\n" + meetingsJson + "\n\n" +
               "Return ONLY a JSON array of meeting IDs (numbers) that are relevant to the query, ordered by relevance. " +
               "If nothing matches, return an empty array. No explanation, no markdown, just the array.\n" +
               "Example: [3, 1, 7]";
    }

    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );
        try {
            return webClient.post()
                    .uri("/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.warn("Gemini search unavailable ({}), using keyword fallback", e.getMessage());
            return null;
        }
    }

    private List<Long> parseIds(String geminiResponse) {
        try {
            JsonNode root = objectMapper.readTree(geminiResponse);
            // Check for API error (quota exceeded etc.)
            if (root.has("error")) {
                log.warn("Gemini returned error: {}", root.path("error").path("message").asText());
                return null;
            }
            String text = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
            text = text.trim().replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            JsonNode arr = objectMapper.readTree(text);
            List<Long> ids = new ArrayList<>();
            if (arr.isArray()) {
                for (JsonNode node : arr) ids.add(node.asLong());
            }
            return ids;
        } catch (Exception e) {
            log.warn("Failed to parse Gemini search response, using keyword fallback");
            return null;
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ");
    }
}
