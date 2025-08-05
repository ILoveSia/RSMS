package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.audit.entity.HodIcItem;

import java.time.LocalDate;

/**
 * 부서장 내부통제 항목 DTO
 * 
 * 단일 책임 원칙(SRP): 부서장 내부통제 항목 데이터 전송만 담당
 * 개방-폐쇄 원칙(OCP): 필요시 상속을 통해 확장 가능
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HodIcItemDto {

    private Long id;
    private Long responsibilityId;   // 책무 ID
    private String responsibilityContent; // 책무 내용
    private Long responsibilityDetailId; // 책무상세 ID
    private String responsibilityDetailContent; // 책무상세 내용
    private Long ledgerOrders;      // 원장순서
    private Long ledgerOrdersHod;   // 부서장 원장순서
    private String orderStatus;      // 순서상태
    private Long approvalId;         // 승인 ID
    private LocalDate dateExpired;   // 만료일자
    private String fieldTypeCd;      // 항목구분
    private String roleTypeCd;       // 직무구분
    private String deptCd;           // 부서코드
    private String icTask;           // 내부통제업무
    private String measureId;        // 조치 ID
    private String measureType;      // 조치유형
    private String measureDesc;      // 조치활동
    private String periodCd;         // 주기
    private String supportDoc;       // 관련근거
    private String checkPeriod;      // 점검시기
    private String checkWay;         // 점검방법
    private String proofDoc;         // 증빙자료

    /**
     * Entity를 DTO로 변환
     * 
     * @param entity HodIcItem entity
     * @return HodIcItemDto
     */
    public static HodIcItemDto fromEntity(HodIcItem entity) {
        return HodIcItemDto.builder()
                .id(entity.getHodIcItemId())
                .responsibilityId(entity.getResponsibilityId())
                .responsibilityContent(entity.getResponsibility() != null ? 
                    entity.getResponsibility().getResponsibilityContent() : "")
                .responsibilityDetailId(entity.getResponsibilityDetailId())
                .responsibilityDetailContent(entity.getResponsibilityDetail() != null ? 
                    entity.getResponsibilityDetail().getResponsibilityDetailContent() : "")
                .ledgerOrders(entity.getLedgerOrders())
                .ledgerOrdersHod(entity.getLedgerOrdersHod())
                .orderStatus(entity.getOrderStatus())
                .approvalId(entity.getApprovalId())
                .dateExpired(entity.getDateExpired())
                .fieldTypeCd(entity.getFieldTypeCd())
                .roleTypeCd(entity.getRoleTypeCd())
                .deptCd(entity.getDeptCd())
                .icTask(entity.getIcTask())
                .measureId(entity.getMeasureId())
                .measureType(entity.getMeasureType())
                .measureDesc(entity.getMeasureDesc())
                .periodCd(entity.getPeriodCd())
                .supportDoc(entity.getSupportDoc())
                .checkPeriod(entity.getCheckPeriod())
                .checkWay(entity.getCheckWay())
                .proofDoc(entity.getProofDoc())
                .build();
    }
}