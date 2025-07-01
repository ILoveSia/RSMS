package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 직책 히스토리 DTO
 * 
 * 직책 변경 이력 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 히스토리 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionHistDto {

    /**
     * 히스토리ID (기록시점)
     */
    private LocalDateTime historyId;

    /**
     * 원본 직책등록ID
     */
    private Long positionsId;

    /**
     * 원장차수
     */
    private String ledgerOrder;

    /**
     * 직책명
     */
    private String positionsNm;

    /**
     * 확정구분코드
     */
    private String confirmGubunCd;

    /**
     * 책무기술서 작성 부서코드
     */
    private String writeDeptCd;

    /**
     * 원본 데이터 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 원본 데이터 수정일시
     */
    private LocalDateTime updatedAt;
} 