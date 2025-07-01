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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 