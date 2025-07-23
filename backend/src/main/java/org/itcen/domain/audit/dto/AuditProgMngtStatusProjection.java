package org.itcen.domain.audit.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 감사프로그램관리 현황 Projection 인터페이스
 *
 * audit_prog_mngt와 audit_prog_mngt_detail 테이블 조인 결과를 담는 Projection 인터페이스입니다.
 * 대상 점검항목수는 audit_prog_mngt_detail의 개수로 계산됩니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 감사프로그램관리 현황 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
public interface AuditProgMngtStatusProjection {

    /**
     * 감사프로그램관리 코드
     */
    String getAuditProgMngtCd();

    /**
     * 감사프로그램명
     */
    String getAuditProgName();

    /**
     * 감사유형코드
     */
    String getAuditTypeCd();

    /**
     * 감사유형명
     */
    String getAuditTypeName();

    /**
     * 책무번호
     */
    String getLedgerOrdersHod();

    /**
     * 감사대상
     */
    String getAuditTarget();

    /**
     * 감사기간 시작일
     */
    LocalDate getAuditStartDate();

    /**
     * 감사기간 종료일
     */
    LocalDate getAuditEndDate();

    /**
     * 감사팀장
     */
    String getAuditTeamLeader();

    /**
     * 감사팀원
     */
    String getAuditTeamMembers();

    /**
     * 감사상태코드
     */
    String getAuditStatusCd();

    /**
     * 감사상태명
     */
    String getAuditStatusName();

    /**
     * 대상 점검항목수 (audit_prog_mngt_detail 개수)
     */
    Long getTargetItemCount();

    /**
     * 결재ID
     */
    Long getApprovalId();

    /**
     * 결재상태코드
     */
    String getApprovalStatus();

    /**
     * 비고
     */
    String getRemarks();

    /**
     * 등록일자
     */
    LocalDateTime getCreatedAt();

    /**
     * 최종수정일자
     */
    LocalDateTime getUpdatedAt();

    /**
     * 생성자 ID
     */
    String getCreatedId();

    /**
     * 수정자 ID
     */
    String getUpdatedId();
}