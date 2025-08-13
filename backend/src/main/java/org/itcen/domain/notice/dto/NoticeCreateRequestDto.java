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

    @Builder.Default
    private Boolean is_public = true;

    @Builder.Default
    private Boolean pinned = false;
}


