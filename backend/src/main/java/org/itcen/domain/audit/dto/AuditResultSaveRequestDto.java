package org.itcen.domain.audit.dto;

import lombok.Data;
import java.util.List;

/**
 * 점검결과 저장 요청 DTO
 */
@Data
public class AuditResultSaveRequestDto {
    
    private List<Long> auditProgMngtDetailIds;    // 점검계획상세 ID 목록
    private String auditResultStatusCd;           // 점검결과
    private String auditResult;                   // 점검결과작성
    private String beforeAuditYn;                // 이전회차 개선과제 동일 여부
    private String auditDetailContent;           // 개선계획 세부내용
    private String auditDoneDt;                  // 이행완료 예정일자 (YYYY-MM-DD)
    private List<AttachmentDataDto> attachments; // 첨부파일 데이터

    /**
     * 첨부파일 데이터 DTO
     */
    @Data
    public static class AttachmentDataDto {
        private String fileName;    // 파일명
        private Long fileSize;      // 파일크기
        private String fileType;    // 파일타입
        private String fileData;    // Base64 encoded 파일 데이터
    }
}