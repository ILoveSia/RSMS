package org.itcen.domain.audit.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 점검결과 상세 조회 요청 DTO
 */
@Data
@NoArgsConstructor
public class AuditResultDetailRequestDto {
    
    /**
     * 점검계획관리상세 ID 목록
     */
    private List<Long> auditProgMngtDetailIds;
}