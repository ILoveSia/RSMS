package org.itcen.domain.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.notice.entity.Notice;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeDetailResponseDto {
    private Long id;
    private String category;
    private String title;
    private String content;
    private Boolean pinned;
    private Integer view_count;
    private LocalDateTime created_at;

    public static NoticeDetailResponseDto from(Notice notice) {
        return NoticeDetailResponseDto.builder()
                .id(notice.getId())
                .category(notice.getCategory())
                .title(notice.getTitle())
                .content(notice.getContent())
                .pinned(Boolean.TRUE.equals(notice.getPinned()))
                .view_count(notice.getViewCount())
                .created_at(notice.getCreatedAt())
                .build();
    }
}


