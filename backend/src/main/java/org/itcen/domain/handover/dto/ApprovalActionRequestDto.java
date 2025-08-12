package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 결재 액션 요청 DTO (승인/반려)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionRequestDto {
    private String comment;
    private String reason;
}