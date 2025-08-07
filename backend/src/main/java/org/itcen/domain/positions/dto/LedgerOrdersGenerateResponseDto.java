package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 원장차수 생성 응답 DTO
 * 
 * 새로운 책무번호 생성 API의 응답 데이터를 담습니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 생성 응답 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 응답에 필요한 데이터만 정의
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerOrdersGenerateResponseDto {

    /**
     * 생성된 원장차수 ID
     */
    private Long ledgerOrdersId;

    /**
     * 생성된 원장차수 제목 (예: "2025-001")
     */
    private String ledgerOrdersTitle;

    /**
     * 생성된 원장차수 진행상태 코드 (항상 "P1")
     */
    private String ledgerOrdersStatusCd;

    /**
     * 이전 원장차수 제목 (참고용)
     */
    private String previousTitle;

    /**
     * 생성 성공 메시지
     */
    private String message;
}