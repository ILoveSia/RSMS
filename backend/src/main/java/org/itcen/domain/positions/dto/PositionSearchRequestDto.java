package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 직책 검색 요청 DTO
 * 
 * 직책 검색 시 필요한 조건을 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 검색 조건 데이터 전송만 담당
 * - Open/Closed: 새로운 검색 조건 추가 시 확장 가능
 * - Interface Segregation: 검색에 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionSearchRequestDto {

    /**
     * 직책등록ID
     */
    private Long positionsId;

    /**
     * 원장차수
     */
    private Long ledgerOrder;

    /**
     * 직책명 (부분검색)
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
     * 페이지 번호 (0부터 시작)
     */
    @Builder.Default
    private int page = 0;

    /**
     * 페이지 크기
     */
    @Builder.Default
    private int size = 20;

    /**
     * 정렬 필드
     */
    @Builder.Default
    private String sortBy = "createdAt";

    /**
     * 정렬 방향 (asc, desc)
     */
    @Builder.Default
    private String sortDirection = "desc";
} 