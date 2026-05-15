package com.meetingtracker.service;

import com.meetingtracker.dto.NoteRequest;
import com.meetingtracker.dto.NoteResponse;
import com.meetingtracker.entity.Meeting;
import com.meetingtracker.entity.Note;
import com.meetingtracker.exception.ResourceNotFoundException;
import com.meetingtracker.repository.MeetingRepository;
import com.meetingtracker.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final MeetingRepository meetingRepository;

    public NoteService(NoteRepository noteRepository, MeetingRepository meetingRepository) {
        this.noteRepository = noteRepository;
        this.meetingRepository = meetingRepository;
    }

    public NoteResponse createNote(NoteRequest request) {
        Meeting meeting = meetingRepository.findById(request.getMeetingId())
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with id: " + request.getMeetingId()));

        Note note = new Note();
        note.setMeeting(meeting);
        note.setContent(request.getContent());
        return toResponse(noteRepository.save(note));
    }

    public List<NoteResponse> getNotesByMeeting(Long meetingId) {
        if (!meetingRepository.existsById(meetingId)) {
            throw new ResourceNotFoundException("Meeting not found with id: " + meetingId);
        }
        return noteRepository.findByMeetingId(meetingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Note not found with id: " + id);
        }
        noteRepository.deleteById(id);
    }

    private NoteResponse toResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setMeetingId(note.getMeeting().getId());
        response.setContent(note.getContent());
        response.setCreatedAt(note.getCreatedAt());
        return response;
    }
}
