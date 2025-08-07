package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.audit.entity.AuditProgMngt;

import java.time.LocalDate;
import java.util.List;

/**
 * 점검계획관리 DTO
 * 
 * 단일 책임 원칙(SRP): 점검계획관리 데이터 전송만 담당
 * 개방-폐쇄 원칙(OCP): 필요시 상속을 통해 확장 가능
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngtDto {

    private Long auditProgMngtId;
    private String auditProgMngtCd;      // 점검계획코드
    private Long ledgerOrdersHod;        // 책무번호
    private String auditTitle;           // 점검회차명
    private LocalDate auditStartDt;      // 점검시작일
    private LocalDate auditEndDt;        // 점검종료일
    private String auditStatusCd;        // 점검상태코드
    private String auditContents;        // 비고
    private List<Long> targetItemIds;    // 선택된 점검 대상 항목 ID 목록
    private List<TargetItemData> targetItemData; // 선택된 점검 대상 상세 정보
    
    // 현황 조회용 추가 필드들
    private String auditProgName;        // 점검계획명
    private String auditTypeCd;          // 점검유형코드
    private String auditTypeName;        // 점검유형명
    private String auditTarget;          // 점검대상
    private String auditStartDate;       // 점검기간 시작일 (문자열)
    private String auditEndDate;         // 점검기간 종료일 (문자열)
    private String auditTeamLeader;      // 점검팀장
    private String auditTeamMembers;     // 점검팀원
    private String auditStatusName;      // 점검상태명
    private Integer targetItemCount;     // 대상 점검항목수
    private Long approvalId;             // 결재ID
    private String approvalStatus;       // 결재상태코드
    private String remarks;              // 비고 (auditContents와 동일)
    private String createdAt;            // 등록일자 (문자열)
    private String updatedAt;            // 최종수정일자 (문자열)

    // 현황 조회용 필드들의 setter 메서드들 (Lombok @Data로 자동 생성되지만 명시적으로 선언)
    public void setAuditProgName(String auditProgName) {
        this.auditProgName = auditProgName;
    }
    
    public void setAuditTypeCd(String auditTypeCd) {
        this.auditTypeCd = auditTypeCd;
    }
    
    public void setAuditTypeName(String auditTypeName) {
        this.auditTypeName = auditTypeName;
    }
    
    public void setAuditTarget(String auditTarget) {
        this.auditTarget = auditTarget;
    }
    
    public void setAuditStartDate(String auditStartDate) {
        this.auditStartDate = auditStartDate;
    }
    
    public void setAuditEndDate(String auditEndDate) {
        this.auditEndDate = auditEndDate;
    }
    
    public void setAuditTeamLeader(String auditTeamLeader) {
        this.auditTeamLeader = auditTeamLeader;
    }
    
    public void setAuditTeamMembers(String auditTeamMembers) {
        this.auditTeamMembers = auditTeamMembers;
    }
    
    public void setAuditStatusName(String auditStatusName) {
        this.auditStatusName = auditStatusName;
    }
    
    public void setTargetItemCount(Integer targetItemCount) {
        this.targetItemCount = targetItemCount;
    }
    
    public void setApprovalId(Long approvalId) {
        this.approvalId = approvalId;
    }
    
    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
    
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Entity를 DTO로 변환
     */
    public static AuditProgMngtDto fromEntity(AuditProgMngt entity) {
        // 점검 대상 상세 정보 변환
        List<TargetItemData> targetItemDataList = entity.getDetails() != null ? 
            entity.getDetails().stream()
                .map(detail -> TargetItemData.builder()
                    .hodIcItemId(detail.getHodIcItemId())
                    .responsibilityId(detail.getResponsibilityId())
                    .responsibilityDetailId(detail.getResponsibilityDetailId())
                    .build())
                .collect(java.util.stream.Collectors.toList()) : 
            new java.util.ArrayList<>();

        // targetItemIds 생성
        List<Long> targetItemIds = targetItemDataList.stream()
            .map(TargetItemData::getHodIcItemId)
            .collect(java.util.stream.Collectors.toList());

        return AuditProgMngtDto.builder()
                .auditProgMngtId(entity.getAuditProgMngtId())
                .auditProgMngtCd(entity.getAuditProgMngtCd())
                .ledgerOrdersHod(entity.getLedgerOrdersHod())
                .auditTitle(entity.getAuditTitle())
                .auditStartDt(entity.getAuditStartDt())
                .auditEndDt(entity.getAuditEndDt())
                .auditStatusCd(entity.getAuditStatusCd())
                .auditContents(entity.getAuditContents())
                .targetItemIds(targetItemIds)
                .targetItemData(targetItemDataList)
                .build();
    }

    /**
     * 점검 대상 상세 정보 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TargetItemData {
        private Long hodIcItemId;       // 부서장 내부통제 항목 ID
        private Long responsibilityId;  // 책무 ID
        private Long responsibilityDetailId; // 책무상세 ID
    }
}