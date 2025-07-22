package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 직책 회의체 DTO
 *
 * 직책별 회의체 정보를 전송하기 위한 DTO입니다.
 * positions_meeting 테이블과 매핑됩니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 직책-회의체 관계 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionMeetingDto {

    /**
     * 직책 회의체 ID
     */
    private int positionsMeetingId;

    /**
     * 직책등록ID
     */
    private Long positionsId;

    /**
     * 회의체 ID
     */
    private String meetingBodyId;

    /**
     * 회의체 이름
     */
    private String meetingBodyName;

    /**
     * 위원장/위원 구분 코드
     */
    private String memberGubun;

    /**
     * 개최주기
     */
    private String meetingPeriod;

    /**
     * 주요 심의·의결사항
     */
    private String deliberationContent;

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
