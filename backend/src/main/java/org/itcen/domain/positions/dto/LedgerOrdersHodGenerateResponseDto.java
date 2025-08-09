package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 부서장 원장차수 생성 응답 DTO
 * 
 * 부서장차수 생성 결과를 반환하는 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 부서장차수 생성 응답 데이터만 담당
 * - Open/Closed: 필요시 필드 확장 가능
 * - Liskov Substitution: DTO의 일반적인 규약 준수
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerOrdersHodGenerateResponseDto {

    /**
     * 생성된 부서장 원장차수 ID
     */
    private Long ledgerOrdersHodId;

    /**
     * 생성된 부서장 원장차수 제목 (ex: "2025-001-01")
     */
    private String ledgerOrdersHodTitle;

    /**
     * 생성된 부서장 원장차수 상태 코드 (P6)
     */
    private String ledgerOrdersHodStatusCd;

    /**
     * 참조된 원장차수 ID
     */
    private Long ledgerOrdersId;

    /**
     * 참조된 원장차수 제목 (ex: "2025-001")
     */
    private String ledgerOrdersTitle;

    /**
     * 응답 메시지
     */
    private String message;
}