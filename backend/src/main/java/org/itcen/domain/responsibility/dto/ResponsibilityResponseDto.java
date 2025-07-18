package org.itcen.domain.responsibility.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
public class ResponsibilityResponseDto {
    private final Long id;
    private final String responsibilityContent;
    private final List<ResponsibilityDetailResponseDto> details;

    @Builder
    public ResponsibilityResponseDto(Long id, String responsibilityContent, List<ResponsibilityDetailResponseDto> details) {
        this.id = id;
        this.responsibilityContent = responsibilityContent;
        this.details = details;
    }
} 