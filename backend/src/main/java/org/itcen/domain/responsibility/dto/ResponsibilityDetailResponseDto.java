package org.itcen.domain.responsibility.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
public class ResponsibilityDetailResponseDto {

    private final Long id;
    private final String responsibilityDetailContent;
    private final String keyManagementTasks;
    private final String relatedBasis;

    @Builder
    public ResponsibilityDetailResponseDto(Long id, String responsibilityDetailContent, String keyManagementTasks, String relatedBasis) {
        this.id = id;
        this.responsibilityDetailContent = responsibilityDetailContent;
        this.keyManagementTasks = keyManagementTasks;
        this.relatedBasis = relatedBasis;
    }
} 