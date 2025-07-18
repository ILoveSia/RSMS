package org.itcen.domain.executiveresponsibility.dto;

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
public class ExecutiveResponsibilityDto {

    // 메인 클래스에 필요한 필드들 추가
    private Long positionsId;
    private String positionNameMapped;
    private Long execofficerId;
    private String empId;
    private String jobRankCd;
    private String jobTitleCd;

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String position; // 직책
        private String jobTitle; // 직위
        private String empNo; // 사번
        private String executiveName; // 성명
        private String responsibility; // 책무
        private String responsibilityDetail; // 책무 세부내용
        private String managementDuty; // 책무이행을 위한 주요 관리의무
        private String relatedBasis; // 관련근거
    }

    @Data
    @Builder
    public static class SearchRequest {
        private String ledgerOrder; // 책무번호
        private String positionId; // 직책 ID
    }
}
