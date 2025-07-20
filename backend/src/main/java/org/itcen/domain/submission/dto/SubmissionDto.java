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
    
    // positions 테이블과 조인된 정보
    private Long positionsId;
    private String positionsNm;  // positions 테이블의 직책명
    private String ledgerOrder;
    private String confirmGubunCd;
    private String writeDeptCd;
}
