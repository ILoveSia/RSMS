package org.itcen.domain.audit.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 점검자 관련 DTO
 * 점검자 조회 및 지정을 위한 데이터 전송 객체
 */
public class AuditorDto {

    /**
     * 점검자 정보 응답 DTO
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditorInfoResponse {
        private String empNo;           // 사번
        private String empName;         // 성명
        private String deptName;        // 부서명
        private String positionName;    // 직급명
        private String email;           // 이메일
        private String phoneNo;         // 전화번호
        private String useYn;           // 사용여부
    }

    /**
     * 점검자 검색 요청 DTO
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditorSearchRequest {
        private String empName;         // 성명 (검색조건)
        private String deptCode;        // 부서코드 (검색조건)
        private String useYn;           // 사용여부 (기본값: Y)
    }

    /**
     * 점검자 지정 요청 DTO
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditorAssignmentRequest {
        private String[] hodIcItemIds;  // 부서장 내부통제 항목 ID 배열
        private String auditorEmpNo;    // 지정할 점검자 사번
        private String auditorName;     // 지정할 점검자 성명
    }

    /**
     * 점검자 지정 응답 DTO
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditorAssignmentResponse {
        private int updatedCount;       // 업데이트된 건수
        private String auditorEmpNo;    // 지정된 점검자 사번
        private String auditorName;     // 지정된 점검자 성명
        private String message;         // 처리 결과 메시지
    }
}