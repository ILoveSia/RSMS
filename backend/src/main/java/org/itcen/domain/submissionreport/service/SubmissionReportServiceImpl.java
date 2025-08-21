package org.itcen.domain.submissionreport.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.common.service.AttachmentService;
import org.itcen.domain.submissionreport.dto.SubmissionReportCreateRequestDto;
import org.itcen.domain.submissionreport.dto.SubmissionReportResponseDto;
import org.itcen.domain.submissionreport.entity.SubmissionReport;
import org.itcen.domain.submissionreport.repository.SubmissionReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionReportServiceImpl implements SubmissionReportService {

    private final SubmissionReportRepository submissionReportRepository;
    private final AttachmentService attachmentService; // Assuming AttachmentService exists

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionReportResponseDto> findAll() {
        return submissionReportRepository.findAll().stream()
                .map(report -> {
                    SubmissionReportResponseDto dto = new SubmissionReportResponseDto(report);
                    dto.setAttachments(attachmentService.getAttachmentsByEntity("SUBMISSION_REPORT", report.getSubmissionReportId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubmissionReportResponseDto createSubmissionReport(SubmissionReportCreateRequestDto createRequestDto) {
        SubmissionReport newReport = new SubmissionReport();
        newReport.setBaseDate(createRequestDto.getBaseDate());
        newReport.setTargetInstitution(createRequestDto.getTargetInstitution());
        // Set other fields... createdBy, etc. from security context if available

        SubmissionReport savedReport = submissionReportRepository.save(newReport);

        // Here you would typically link the attachments passed in the DTO
        if (createRequestDto.getAttachmentIds() != null && !createRequestDto.getAttachmentIds().isEmpty()) {
            attachmentService.linkAttachments(savedReport.getSubmissionReportId(), "SUBMISSION_REPORT", createRequestDto.getAttachmentIds());
        }

        return new SubmissionReportResponseDto(savedReport);
    }

    @Override
    @Transactional
    public SubmissionReportResponseDto updateSubmissionReport(Long id, SubmissionReportCreateRequestDto updateRequestDto) {
        SubmissionReport existingReport = submissionReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("제출 보고서를 찾을 수 없습니다: " + id));

        // Update fields
        existingReport.setBaseDate(updateRequestDto.getBaseDate());
        existingReport.setTargetInstitution(updateRequestDto.getTargetInstitution());
        existingReport.setUpdatedBy("system"); // TODO: Replace with actual user ID

        SubmissionReport savedReport = submissionReportRepository.save(existingReport);

        // Handle attachments if provided
        if (updateRequestDto.getAttachmentIds() != null && !updateRequestDto.getAttachmentIds().isEmpty()) {
            attachmentService.linkAttachments(savedReport.getSubmissionReportId(), "SUBMISSION_REPORT", updateRequestDto.getAttachmentIds());
        }

        return new SubmissionReportResponseDto(savedReport);
    }

    @Override
    @Transactional
    public void deleteSubmissionReport(Long submissionReportId) {
        // First, delete associated attachments
        attachmentService.deleteAllAttachmentsByEntity("SUBMISSION_REPORT", submissionReportId, "system");
        // Then, delete the report itself
        submissionReportRepository.deleteById(submissionReportId);
    }
}
