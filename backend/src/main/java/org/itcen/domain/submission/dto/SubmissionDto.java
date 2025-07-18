package org.itcen.domain.submission.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionDto {
    private Long id;
    private String historyCode;
    private String executiveName;
    private String position;
    private LocalDate submissionDate;
    private String attachmentFile;
    private String remarks;
}
