package org.itcen.domain.qna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaCommentDto {
    private Long id;
    private Long parentId;
    private String content;
    private Boolean isDeleted;
    private String createdId;
    private LocalDateTime createdAt;

    public static QnaCommentDto of(
            Long id,
            Long parentId,
            String content,
            Boolean isDeleted,
            String createdId,
            LocalDateTime createdAt
    ) {
        return QnaCommentDto.builder()
                .id(id)
                .parentId(parentId)
                .content(content)
                .isDeleted(isDeleted)
                .createdId(createdId)
                .createdAt(createdAt)
                .build();
    }
}


