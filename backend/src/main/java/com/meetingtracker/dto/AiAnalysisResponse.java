package com.meetingtracker.dto;

import java.util.List;

public class AiAnalysisResponse {
    private String summary;
    private List<String> suggestedTasks;

    public AiAnalysisResponse() {}

    public AiAnalysisResponse(String summary, List<String> suggestedTasks) {
        this.summary = summary;
        this.suggestedTasks = suggestedTasks;
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getSuggestedTasks() { return suggestedTasks; }
    public void setSuggestedTasks(List<String> suggestedTasks) { this.suggestedTasks = suggestedTasks; }
}
