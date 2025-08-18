package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 최근 완료 업무 DTO
 * 최근 완료된 업무 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentTaskDto {
    
    /**
     * 업무명
     */
    private String taskName;
    
    /**
     * 완료 시점 (예: "2시간 전", "1일 전")
     */
    private String completedAt;
    
    /**
     * 업무 카테고리 (예: "결재", "점검", "관리")
     */
    private String category;
}