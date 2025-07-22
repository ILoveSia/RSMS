package org.itcen.domain.submission.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubmissionDto {
    private Long id;
    private String submitHistCd;
    private String execofficerId;
    private LocalDate rmSubmitDt;
    private String updateYn;
    private String rmSubmitRemarks;
    private Long positionsId;
    private String createdId;
    private String updatedId;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    
    // positions 테이블과 조인된 정보
    private String positionsNm;  // positions 테이블의 직책명
    private String ledgerOrder;
    private String confirmGubunCd;
    private String writeDeptCd;
    
    // 프론트엔드 호환성을 위한 필드들 (deprecated but kept for compatibility)
    @Deprecated
    private String historyCode;
    @Deprecated
    private String executiveName;
    @Deprecated
    private String position;
    @Deprecated
    private LocalDate submissionDate;
    @Deprecated
    private String attachmentFile;
    @Deprecated
    private String remarks;
}
