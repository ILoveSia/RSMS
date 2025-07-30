package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.audit.entity.HodIcItem;

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
    private String fieldTypeCd;      // 항목구분
    private String icTask;           // 내부통제업무
    private String measureType;      // 조치유형
    private String periodCd;         // 주기
    private String checkPeriod;      // 점검시기
    private String checkWay;         // 점검사항

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
                .fieldTypeCd(entity.getFieldTypeCd())
                .icTask(entity.getIcTask())
                .measureType(entity.getMeasureType())
                .periodCd(entity.getPeriodCd())
                .checkPeriod(entity.getCheckPeriod())
                .checkWay(entity.getCheckWay())
                .build();
    }
}