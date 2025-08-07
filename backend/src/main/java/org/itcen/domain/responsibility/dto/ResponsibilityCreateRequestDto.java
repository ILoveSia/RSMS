package org.itcen.domain.responsibility.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ResponsibilityCreateRequestDto {
    private String responsibilityContent;
    private List<ResponsibilityDetailDto> details;
    private Long ledgerOrder; // 원장차수 ID (신규 등록시만 사용)
} 