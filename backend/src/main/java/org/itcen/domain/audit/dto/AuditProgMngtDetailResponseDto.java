package org.itcen.domain.audit.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 감사프로그램관리상세 응답 DTO
 *
 * 감사프로그램관리상세 조회 시 사용되는 응답 데이터를 담는 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 감사프로그램관리상세 응답 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngtDetailResponseDto {

    /**
     * 감사프로그램관리상세 ID
     */
    private Long auditProgMngtDetailId;

    /**
     * 감사프로그램관리 코드
     */
    private String auditProgMngtCd;

    /**
     * 점검항목명
     */
    private String auditItemName;

    /**
     * 점검내용
     */
    private String auditContent;

    /**
     * 점검방법
     */
    private String auditMethod;

    /**
     * 점검기준
     */
    private String auditStandard;

    /**
     * 위험도
     */
    private String riskLevel;

    /**
     * 위험도명
     */
    private String riskLevelName;

    /**
     * 중요도
     */
    private String importanceLevel;

    /**
     * 중요도명
     */
    private String importanceLevelName;

    /**
     * 점검결과
     */
    private String auditResult;

    /**
     * 발견사항
     */
    private String findings;

    /**
     * 개선권고사항
     */
    private String recommendations;

    /**
     * 점검상태코드
     */
    private String auditStatusCd;

    /**
     * 점검상태명
     */
    private String auditStatusName;

    /**
     * 정렬순서
     */
    private Integer sortOrder;

    /**
     * 사용여부
     */
    private String useYn;

    /**
     * 등록일자
     */
    private LocalDateTime createdAt;

    /**
     * 최종수정일자
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