package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 인수인계 지정 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HandoverAssignmentDto {

    private Long assignmentId;
    private Long positionId;
    private String handoverType;

    // 인계자 정보
    private String handoverFromEmpNo;
    private String handoverFromName;


    // 인수자 정보
    private String handoverToEmpNo;
    private String handoverToName;


    // 일정 정보
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;

    // 상태 관리
    private String status;
    private Integer progressRate;

    // 비고
    private String notes;

    // 감사 필드
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdId;
    private String updatedId;

    // 프론트엔드 호환성을 위한 추가 필드
    private String assignmentTitle;
    private String assignmentType;
    private String assignorEmpNo;
    private String assignorName;
    private String assigneeEmpNo;
    private String assigneeName;
    private String deptCd;
    private String positionCd;
    private String positionName;
    private String targetDate;
    private String description;
    private String assignorApprovalStatus;
    private String assigneeApprovalStatus;
    private String managerApprovalStatus;

    /**
     * 프론트엔드 호환성을 위한 매핑 메서드
     */
    public void mapForFrontend() {
        this.assignmentTitle = (this.handoverFromName != null ? this.handoverFromName : "미지정") +
                " → " +
                (this.handoverToName != null ? this.handoverToName : "미지정") +
                " 인수인계";
        this.assignmentType = this.handoverType;
        this.assignorEmpNo = this.handoverFromEmpNo;
        this.assignorName = this.handoverFromName;
        this.assigneeEmpNo = this.handoverToEmpNo;
        this.assigneeName = this.handoverToName;

        this.targetDate = this.plannedEndDate != null ? this.plannedEndDate.toString() : null;
        this.description = this.notes;

        // 승인 상태는 임시로 설정 (실제로는 별도 테이블에서 관리)
        this.assignorApprovalStatus = "APPROVED";
        this.assigneeApprovalStatus = "PENDING";
        this.managerApprovalStatus = "PENDING";
    }
}