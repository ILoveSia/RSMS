package org.itcen.domain.audit.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

/**
 * 점검결과 저장 응답 DTO
 */
@Data
@Builder
public class AuditResultSaveResponseDto {
    
    private boolean success;           // 성공 여부
    private String message;            // 응답 메시지
    private int updatedCount;          // 업데이트된 항목 수
    private List<Long> attachmentIds;  // 저장된 첨부파일 ID 목록
}