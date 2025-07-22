package org.itcen.domain.responsibility.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ResponsibilityResponseDto {
    private Long id;
    private String responsibilityContent;
    private String responsibilityDetailContent;
    private String responsibilityRelEvid;
    private String responsibilityMgtSts;
    // private List<ResponsibilityDetailResponseDto> details;

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String responsibilityContent;
        private List<ResponsibilityDetailResponseDto> details;
    }

    @Data
    @Builder
    public static class SearchRequest {
        private String id;
        private String responsibilityContent;
        private List<ResponsibilityDetailResponseDto> details;
    }

    @Data
    @Builder
    public static class SearchResponse {
        private Long id;
        private String responsibilityContent;
        private List<ResponsibilityDetailResponseDto> details;
    }
}
