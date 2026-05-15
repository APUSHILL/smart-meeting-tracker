package com.meetingtracker.dto;

public class DashboardResponse {

    private long totalMeetings;
    private long pendingTasks;
    private long completedTasks;
    private long overdueTasks;

    public DashboardResponse(long totalMeetings, long pendingTasks, long completedTasks, long overdueTasks) {
        this.totalMeetings = totalMeetings;
        this.pendingTasks = pendingTasks;
        this.completedTasks = completedTasks;
        this.overdueTasks = overdueTasks;
    }

    public long getTotalMeetings() { return totalMeetings; }
    public long getPendingTasks() { return pendingTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
}
