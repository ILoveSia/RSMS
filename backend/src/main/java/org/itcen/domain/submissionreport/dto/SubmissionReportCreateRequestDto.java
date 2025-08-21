package org.itcen.domain.submissionreport.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List; // Added this import

@Getter
@Setter
public class SubmissionReportCreateRequestDto {

    private LocalDate baseDate;
    private String targetInstitution;
    // Frontend will upload files first, then pass the attachment IDs here
    private List<Long> attachmentIds; // Uncommented this line
}
