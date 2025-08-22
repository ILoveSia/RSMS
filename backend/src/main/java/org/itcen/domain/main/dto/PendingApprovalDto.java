package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 처리 대기 결재 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingApprovalDto {
    
    private Long approvalId;
    private String taskTypeCd;
    private String taskTypeInfo;
    private Long taskId;
    private String requesterId;
    private String requesterName;
    private LocalDateTime requestDatetime;
    private String comments;
    private String urgency;
}