package org.itcen.domain.audit.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * 이행결과 업데이트 응답 DTO
 * 
 * 단일 책임 원칙(SRP): 이행결과 업데이트 응답 데이터 전송만 담당
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImplementationResultUpdateResponseDto {

    /**
     * 업데이트 성공 여부
     */
    private boolean success;

    /**
     * 메시지
     */
    private String message;

    /**
     * 업데이트된 점검 계획관리 상세 ID
     */
    private Long auditProgMngtDetailId;

    /**
     * 업데이트된 imp_pl_status_cd 값
     */
    private String impPlStatusCd;
}