package org.itcen.domain.submissionreport.dto;

import lombok.Getter;
import lombok.Setter;
import org.itcen.domain.common.dto.AttachmentDto;
import org.itcen.domain.submissionreport.entity.SubmissionReport;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class SubmissionReportResponseDto {

    private Long submissionReportId;
    private LocalDate baseDate;
    private String targetInstitution;
    private List<AttachmentDto.Response> attachments;

    public SubmissionReportResponseDto(SubmissionReport submissionReport) {
        this.submissionReportId = submissionReport.getSubmissionReportId();
        this.baseDate = submissionReport.getBaseDate();
        this.targetInstitution = submissionReport.getTargetInstitution();
    }
}
