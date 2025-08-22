package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 최근 공지사항 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentNoticeDto {
    
    private Long id;
    private String title;
    private String category;
    private LocalDateTime createdAt;
    private Integer viewCount;
    private Boolean pinned;
}