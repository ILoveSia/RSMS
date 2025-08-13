package org.itcen.domain.qna.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QnaCommentCreateRequest {
    private Long parentId; // null이면 최상위 댓글

    @NotBlank
    private String content;
}


