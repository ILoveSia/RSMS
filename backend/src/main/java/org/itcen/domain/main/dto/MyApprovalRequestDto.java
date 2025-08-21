package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 내 결재 신청 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyApprovalRequestDto {
    
    private Long approvalId;
    private String taskTypeCd;
    private String taskTypeInfo;
    private Long taskId;
    private String apprStatCd;
    private String apprStatName;
    private LocalDateTime requestDatetime;
    private String approverId;
    private String approverName;
    private String comments;
}