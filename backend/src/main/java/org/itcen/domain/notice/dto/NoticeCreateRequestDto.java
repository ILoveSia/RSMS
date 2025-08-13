package org.itcen.domain.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeCreateRequestDto {
    @Size(max = 50)
    private String category;

    @NotBlank
    @Size(max = 500)
    private String title;

    private String content;

    // 제거됨: 공개여부 컬럼 삭제

    @Builder.Default
    private Boolean pinned = false;
}


