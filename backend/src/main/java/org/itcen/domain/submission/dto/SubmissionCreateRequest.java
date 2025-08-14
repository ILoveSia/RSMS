package org.itcen.domain.submission.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

/**
 * 제출 이력 생성 요청 DTO
 */
@Data
public class SubmissionCreateRequest {
    private String submitHistCd;
    private String execofficerId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rmSubmitDt;
    
    private String updateYn;
    private String rmSubmitRemarks;
    private Long positionsId;
    private String bankCd;
    
    // 프론트엔드 호환성을 위한 필드들 (deprecated but kept for compatibility)
    @Deprecated
    private String historyCode;
    @Deprecated
    private String executiveName;
    @Deprecated
    private String position;
    @Deprecated
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate submissionDate;
    @Deprecated
    private String remarks;
    @Deprecated
    private String attachmentFile;
}