package org.itcen.domain.hodicitem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * 부서장 내부통제 항목 등록 요청 DTO
 *
 * 부서장 내부통제 항목 등록 시 필요한 데이터를 담는 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 등록 요청 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 등록에 필요한 데이터만 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HodICItemCreateRequestDto {

    /**
     * 책무 ID (필수)
     */
    @NotNull(message = "책무 ID는 필수입니다.")
    private Long responsibilityId;

    /**
     * 책무상세 ID
     */
    private Long responsibilityDetailId;

    /**
     * 책무번호(원장차수)
     */
    private Long ledgerOrders;

    /**
     * 부서장 책무번호(원장차수)
     */
    private Long ledgerOrdersHod;

    /**
     * 책무상태코드
     */
    private String orderStatus;

    /**
     * 만료일
     */
    @Builder.Default
    private LocalDate dateExpired = LocalDate.of(9999, 12, 31);

    /**
     * 항목구분 (부서공통항목, 부서고유항목) FIELD_TYPE
     */
    private String fieldTypeCd;

    /**
     * 직무구분코드 (COM_ROLE_TYPE, UNI_ROLE_TYPE)
     */
    private String roleTypeCd;

    /**
     * 부서코드
     */
    private String deptCd;

    /**
     * 내부통제업무
     */
    private String icTask;

    /**
     * 조치활동ID
     */
    private String measureId;

    /**
     * 조치활동내용
     */
    private String measureDesc;

    /**
     * 조치유형
     */
    private String measureType;

    /**
     * 주기 (PERIOD)
     */
    private String periodCd;

    /**
     * 관련근거
     */
    private String supportDoc;

    /**
     * 점검시기(MONTH)
     */
    private String checkPeriod;

    /**
     * 점검방법
     */
    private String checkWay;

    /**
     * 증빙자료
     */
    private String proofDoc;
}
