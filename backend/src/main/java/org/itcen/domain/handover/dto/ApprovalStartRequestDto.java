package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 결재 요청 시작 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStartRequestDto {
    private String taskTypeCode;
    private Long taskId;
    private String title;
    private String description;
}