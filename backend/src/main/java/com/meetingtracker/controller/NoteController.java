package com.meetingtracker.controller;

import com.meetingtracker.dto.NoteRequest;
import com.meetingtracker.dto.NoteResponse;
import com.meetingtracker.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(@Valid @RequestBody NoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.createNote(request));
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<NoteResponse>> getNotesByMeeting(@PathVariable Long meetingId) {
        return ResponseEntity.ok(noteService.getNotesByMeeting(meetingId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
