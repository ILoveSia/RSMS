package org.itcen.domain.submissionreport.controller;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.submissionreport.dto.SubmissionReportCreateRequestDto;
import org.itcen.domain.submissionreport.dto.SubmissionReportResponseDto;
import org.itcen.domain.submissionreport.service.SubmissionReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submission-reports")
@RequiredArgsConstructor
public class SubmissionReportController {

    private final SubmissionReportService submissionReportService;

    @GetMapping
    public ResponseEntity<List<SubmissionReportResponseDto>> getAllSubmissionReports() {
        List<SubmissionReportResponseDto> reports = submissionReportService.findAll();
        return ResponseEntity.ok(reports);
    }

    @PostMapping
    public ResponseEntity<SubmissionReportResponseDto> createSubmissionReport(@RequestBody SubmissionReportCreateRequestDto createRequestDto) {
        SubmissionReportResponseDto createdReport = submissionReportService.createSubmissionReport(createRequestDto);
        return ResponseEntity.ok(createdReport);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubmissionReportResponseDto> updateSubmissionReport(@PathVariable Long id, @RequestBody SubmissionReportCreateRequestDto updateRequestDto) {
        SubmissionReportResponseDto updatedReport = submissionReportService.updateSubmissionReport(id, updateRequestDto);
        return ResponseEntity.ok(updatedReport);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmissionReport(@PathVariable Long id) {
        submissionReportService.deleteSubmissionReport(id);
        return ResponseEntity.noContent().build();
    }
}
