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

    // 비고
    private String notes;

    // 감사 필드
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdId;
    private String updatedId;

    // 프론트엔드 호환성을 위한 추가 필드
    private String assignmentType;
    private String assignorEmpNo;
    private String assigneeEmpNo;
    private String assignorDeptCd;
    private String assigneeDeptCd;
    private String assignorPositionCd;
    private String assigneePositionCd;
    private Long assignorPositionId;
    private Long assigneePositionId;
    private String targetDate;
    private String description;
    /**
     * 프론트엔드 호환성을 위한 매핑 메서드
     */
    public void mapForFrontend() {
        this.assignmentType = this.handoverType;
        this.assignorEmpNo = this.handoverFromEmpNo;
        this.assigneeEmpNo = this.handoverToEmpNo;

        this.targetDate = this.plannedEndDate != null ? this.plannedEndDate.toString() : null;
        this.description = this.notes;
    }
}