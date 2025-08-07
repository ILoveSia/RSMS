package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 원장차수 상태 확인 DTO
 * 
 * 새로운 책무번호 생성 가능 여부를 확인하는 데이터를 담습니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 상태 확인 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 상태 확인에 필요한 데이터만 정의
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerOrdersStatusCheckDto {

    /**
     * 현재 최신 원장차수 ID
     */
    private Long currentLedgerOrdersId;

    /**
     * 현재 최신 원장차수 제목
     */
    private String currentTitle;

    /**
     * 현재 최신 원장차수 상태 코드
     */
    private String currentStatusCd;

    /**
     * 새로운 차수 생성 가능 여부
     */
    private boolean canGenerate;

    /**
     * 상태 메시지
     */
    private String message;

    /**
     * 데이터 존재 여부 (첫 번째 차수인지 확인)
     */
    private boolean hasData;
}