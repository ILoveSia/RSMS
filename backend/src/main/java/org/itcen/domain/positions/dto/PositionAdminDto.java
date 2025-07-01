package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 직책 관리자 DTO
 * 
 * 직책별 관리자 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책-관리자 관계 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionAdminDto {

    /**
     * 직책 관리자 일련번호
     */
    private Long positionsAdminSeq;

    /**
     * 직책등록ID
     */
    private Long positionsId;

    /**
     * 직책 관리자 ID (사번 등)
     */
    private String positionsAdminId;

    /**
     * 직책 관리자 이름
     */
    private String positionsAdminName;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 생성자 ID
     */
    private String createdId;

    /**
     * 수정자 ID
     */
    private String updatedId;
} 