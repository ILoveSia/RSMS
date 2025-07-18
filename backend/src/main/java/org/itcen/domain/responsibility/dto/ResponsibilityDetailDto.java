package org.itcen.domain.responsibility.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponsibilityDetailDto {
    private String responsibilityDetailContent;
    private String keyManagementTasks; // 프론트엔드에서 넘어오는 필드명
    private String relatedBasis;
} 