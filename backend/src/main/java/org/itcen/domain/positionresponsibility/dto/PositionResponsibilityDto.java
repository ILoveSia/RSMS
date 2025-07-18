package org.itcen.domain.positionresponsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.time.Instant;

/**
 * 임원별 책무 현황 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PositionResponsibilityDto {

    // 메인 클래스에 필요한 필드들 추가
    private Long positions_id;
    private String positions_name;
    private String role_summ;
    private Long respontibility_id;
    private Instant created_at;
    private Instant updated_at;
    private String responsibility_conent;
    private String responsibility_detail_content;

    @Data
    @Builder
    public static class Response {
        private Long positions_id;
        private String positions_name;
        private String role_summ;
        private String respontibility_id;
        private String responsibility_conent;
        private String responsibility_detail_content;


    }

    @Data
    @Builder
    public static class SearchRequest {
        private String positions_id;
        private String positions_nm;
        private String role_summ;
        private String respontibility_id;
        private String responsibility_conent;
        private String responsibility_detail_content;

    }
}
