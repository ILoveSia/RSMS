package org.itcen.domain.hodicitem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 부서장 내부통제 항목 현황 Projection DTO
 *
 * JOIN 쿼리 결과를 담는 DTO입니다.
 * hod_ic_item, responsibility, ledger_orders, approval 테이블의 정보를 포함합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 내부통제 항목 현황 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HodICItemStatusProjection {

    /**
     * 부서장 내부통제 항목 ID
     */
    private Long hodIcItemId;

    /**
     * 책무 ID
     */
    private Long responsibilityId;

    /**
     * 책무 내용
     */
    private String responsibilityContent;

    /**
     * 부서명
     */
    private String deptCd;

    /**
     * 항목구분
     */
    private String fieldTypeCd;

    /**
     * 직무구분
     */
    private String roleTypeCd;

    /**
     * 내부통제 업무
     */
    private String icTask;

    /**
     * 조치활동
     */
    private String measureDesc;

    /**
     * 조치유형
     */
    private String measureType;

    /**
     * 주기
     */
    private String periodCd;

    /**
     * 관련근거
     */
    private String supportDoc;

    /**
     * 점검시기
     */
    private String checkPeriod;

    /**
     * 점검방법
     */
    private String checkWay;

    /**
     * 등록일자
     */
    private LocalDateTime createdAt;

    /**
     * 최종수정일자
     */
    private LocalDateTime updatedAt;

    /**
     * 결재상태
     */
    private String approvalStatus;

    /**
     * 책무번호(원장차수)
     */
    private String ledgerOrder;
}
