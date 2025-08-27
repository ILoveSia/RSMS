package org.itcen.domain.responsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponsibilityStatusDto {

    private Long responsibilityId;
    private String responsibilityContent;

    private Long responsibilityDetailId;
    private String responsibilityDetailContent;
    private String responsibilityMgtSts;
    private String responsibilityRelEvid;
    
    private String ledgerOrdersStatusCd; // 원장 상태 코드 (P5: 최종확정)

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 