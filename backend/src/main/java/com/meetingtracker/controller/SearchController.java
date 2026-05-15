package com.meetingtracker.controller;

import com.meetingtracker.dto.MeetingResponse;
import com.meetingtracker.dto.SearchRequest;
import com.meetingtracker.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping
    public ResponseEntity<List<MeetingResponse>> search(
            @RequestBody SearchRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(searchService.search(request.getQuery(), user.getUsername()));
    }
}
