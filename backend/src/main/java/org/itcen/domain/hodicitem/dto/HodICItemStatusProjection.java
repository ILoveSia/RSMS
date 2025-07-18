package org.itcen.domain.hodicitem.dto;

import java.time.LocalDateTime;

/**
 * 부서장 내부통제 항목 현황 Projection 인터페이스
 *
 * JOIN 쿼리 결과를 담는 Projection 인터페이스입니다.
 * hod_ic_item, responsibility, ledger_orders, approval 테이블의 정보를 포함합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 내부통제 항목 현황 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
public interface HodICItemStatusProjection {

    /**
     * 부서장 내부통제 항목 ID
     */
    Long getHodIcItemId();

    /**
     * 책무 ID
     */
    Long getResponsibilityId();

    /**
     * 책무 내용
     */
    String getResponsibilityContent();

    /**
     * 부서명
     */
    String getDeptCd();

    /**
     * 항목구분
     */
    String getFieldTypeCd();

    /**
     * 직무구분
     */
    String getRoleTypeCd();

    /**
     * 내부통제 업무
     */
    String getIcTask();

    /**
     * 조치활동
     */
    String getMeasureDesc();

    /**
     * 조치유형
     */
    String getMeasureType();

    /**
     * 주기
     */
    String getPeriodCd();

    /**
     * 관련근거
     */
    String getSupportDoc();

    /**
     * 점검시기
     */
    String getCheckPeriod();

    /**
     * 점검방법
     */
    String getCheckWay();

    /**
     * 등록일자
     */
    LocalDateTime getCreatedAt();

    /**
     * 최종수정일자
     */
    LocalDateTime getUpdatedAt();

    /**
     * 결재상태
     */
    String getApprovalStatus();

    /**
     * 책무번호(원장차수)
     */
    String getLedgerOrder();
}
