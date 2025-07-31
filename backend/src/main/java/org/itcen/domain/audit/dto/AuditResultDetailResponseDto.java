package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 점검결과 상세 조회 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditResultDetailResponseDto {
    
    /**
     * 점검계획관리상세 ID
     */
    private Long auditProgMngtDetailId;
    
    /**
     * 점검결과 상태 코드
     */
    private String auditResultStatusCd;
    
    /**
     * 점검결과 내용
     */
    private String auditResult;
    
    /**
     * 이전회차 개선과제 동일 여부
     */
    private String beforeAuditYn;
    
    /**
     * 개선계획 세부 내용
     */
    private String auditDetailContent;
    
    /**
     * 이행완료 예정일자
     */
    private String auditDoneDt;
    
    /**
     * 첨부파일 목록
     */
    private List<ExistingAttachmentDto> attachments;
}