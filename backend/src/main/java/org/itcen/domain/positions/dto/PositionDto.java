package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 직책 기본 DTO
 * 
 * 직책 정보를 전송하기 위한 기본 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDto {

    /**
     * 직책등록ID
     */
    private Long positionsId;

    /**
     * 원장차수
     */
    private Long ledgerOrder;

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
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;
} 