package org.itcen.domain.positionresponsibility.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
    private String responsibility_mgt_sts; // 주요 관리업무
    private String responsibility_rel_evid; // 관련 근거
    private Long ledger_orders_id; // 원장차수 ID
    private String ledger_orders_title; // 원장차수 제목 (책무번호)
    private String ledger_orders_status_cd; // 원장차수 상태코드 (진행상태)
    private String appr_stat_cd; // 결재진행상태코드
    private Long role_resp_status_id; // 직책별책무현황 ID

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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponsibilityCreateRequestDto {
        private Long positions_id;
        private Long responsibility_id;
        private String updated_id;
        private String role_summ;
        private Long ledger_order; // ledger_orders_id 추가
    }
}
