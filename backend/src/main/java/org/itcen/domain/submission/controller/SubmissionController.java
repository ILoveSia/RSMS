package org.itcen.domain.submission.controller;

import lombok.RequiredArgsConstructor;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.submission.dto.SubmissionDto;
import org.itcen.domain.submission.service.SubmissionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    public ApiResponse<SubmissionDto> create(@RequestBody SubmissionDto dto) {
        return ApiResponse.success(submissionService.createSubmission(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<SubmissionDto> update(@PathVariable Long id, @RequestBody SubmissionDto dto) {
        return ApiResponse.success(submissionService.updateSubmission(id, dto));
    }

    @GetMapping("/{id}")
    public ApiResponse<SubmissionDto> get(@PathVariable Long id) {
        return ApiResponse.success(submissionService.getSubmission(id));
    }
}
