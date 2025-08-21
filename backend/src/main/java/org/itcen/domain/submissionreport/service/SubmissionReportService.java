package org.itcen.domain.submissionreport.service;

import org.itcen.domain.submissionreport.dto.SubmissionReportCreateRequestDto;
import org.itcen.domain.submissionreport.dto.SubmissionReportResponseDto;

import java.util.List;

public interface SubmissionReportService {

    List<SubmissionReportResponseDto> findAll();

    SubmissionReportResponseDto createSubmissionReport(SubmissionReportCreateRequestDto createRequestDto);

    SubmissionReportResponseDto updateSubmissionReport(Long id, SubmissionReportCreateRequestDto updateRequestDto);

    void deleteSubmissionReport(Long submissionReportId);
}
