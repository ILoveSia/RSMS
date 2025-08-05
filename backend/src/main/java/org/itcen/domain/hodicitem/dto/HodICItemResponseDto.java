package org.itcen.domain.hodicitem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.hodicitem.entity.HodICItem;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 부서장 내부통제 항목 응답 DTO
 *
 * 부서장 내부통제 항목 상세 정보를 전달하는 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 응답 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 응답에 필요한 데이터만 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HodICItemResponseDto {

    /**
     * 부서장 내부통제 항목 ID
     */
    private Long hodIcItemId;

    /**
     * 책무 ID
     */
    private Long responsibilityId;

    /**
     * 책무상세 ID
     */
    private Long responsibilityDetailId;

    /**
     * 책무 내용 (조인된 정보)
     */
    private String responsibilityContent;

    /**
     * 책무상세 내용 (조인된 정보)
     */
    private String responsibilityDetailContent;

    /**
     * 책무관련근거 (조인된 정보)
     */
    private String responsibilityRelEvid;

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
     * 결재 ID
     */
    private Long approvalId;

    /**
     * 결재 상태
     */
    private String approvalStatus;

    /**
     * 만료일
     */
    private LocalDate dateExpired;

    /**
     * 항목구분
     */
    private String fieldTypeCd;

    /**
     * 직무구분코드
     */
    private String roleTypeCd;

    /**
     * 부서코드
     */
    private String deptCd;

    /**
     * 부서명 (조인된 정보)
     */
    private String deptName;

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
     * 증빙자료
     */
    private String proofDoc;

    /**
     * 생성자 ID
     */
    private String createdId;

    /**
     * 수정자 ID
     */
    private String updatedId;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 엔티티로부터 DTO 생성
     */
    public static HodICItemResponseDto from(HodICItem entity) {
        return HodICItemResponseDto.builder()
                .hodIcItemId(entity.getHodIcItemId())
                .responsibilityId(entity.getResponsibilityId())
                .responsibilityDetailId(entity.getResponsibilityDetailId())
                .responsibilityContent(entity.getResponsibility() != null ?
                    entity.getResponsibility().getResponsibilityContent() : null)
                .responsibilityDetailContent(entity.getResponsibilityDetail() != null ?
                    entity.getResponsibilityDetail().getResponsibilityDetailContent() : null)
                .responsibilityRelEvid(entity.getResponsibilityDetail() != null ?
                    entity.getResponsibilityDetail().getResponsibilityRelEvid() : null)
                .ledgerOrders(entity.getLedgerOrders())
                .ledgerOrdersHod(entity.getLedgerOrdersHod())
                .orderStatus(entity.getOrderStatus())
                .approvalId(entity.getApprovalId())
                .dateExpired(entity.getDateExpired())
                .fieldTypeCd(entity.getFieldTypeCd())
                .roleTypeCd(entity.getRoleTypeCd())
                .deptCd(entity.getDeptCd())
                .deptName(entity.getDepartment() != null ?
                    entity.getDepartment().getDepartmentName() : null)
                .icTask(entity.getIcTask())
                .measureId(entity.getMeasureId())
                .measureDesc(entity.getMeasureDesc())
                .measureType(entity.getMeasureType())
                .periodCd(entity.getPeriodCd())
                .supportDoc(entity.getSupportDoc())
                .checkPeriod(entity.getCheckPeriod())
                .checkWay(entity.getCheckWay())
                .proofDoc(entity.getProofDoc())
                .createdId(entity.getCreatedId())
                .updatedId(entity.getUpdatedId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
