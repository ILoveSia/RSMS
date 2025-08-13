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
public class NoticeListResponseDto {
    // 테이블 칼럼명과 동일한 응답 필드명 유지
    private Long id;
    private String category;
    private String title;
    private String content;
    // 제거됨: 공개여부 컬럼 삭제로 인한 응답 필드 제거
    private Boolean pinned;
    private Integer view_count;
    private LocalDateTime created_at;

    public static NoticeListResponseDto from(Notice notice) {
        return NoticeListResponseDto.builder()
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


