package org.itcen.domain.audit.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 감사프로그램관리 응답 DTO
 *
 * 감사프로그램관리 조회 시 사용되는 응답 데이터를 담는 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 감사프로그램관리 응답 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngtResponseDto {

    /**
     * 감사프로그램관리 코드
     */
    private String auditProgMngtCd;

    /**
     * 감사프로그램명
     */
    private String auditProgName;

    /**
     * 감사유형코드
     */
    private String auditTypeCd;

    /**
     * 감사유형명
     */
    private String auditTypeName;

    /**
     * 감사대상
     */
    private String auditTarget;

    /**
     * 감사기간 시작일
     */
    private LocalDate auditStartDate;

    /**
     * 감사기간 종료일
     */
    private LocalDate auditEndDate;

    /**
     * 감사팀장
     */
    private String auditTeamLeader;

    /**
     * 감사팀원
     */
    private String auditTeamMembers;

    /**
     * 감사상태코드
     */
    private String auditStatusCd;

    /**
     * 감사상태명
     */
    private String auditStatusName;

    /**
     * 대상 점검항목수
     */
    private Long targetItemCount;

    /**
     * 결재ID
     */
    private Long approvalId;

    /**
     * 결재상태코드
     */
    private String approvalStatus;

    /**
     * 비고
     */
    private String remarks;

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