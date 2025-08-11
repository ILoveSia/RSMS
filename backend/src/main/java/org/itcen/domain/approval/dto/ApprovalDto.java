package org.itcen.domain.approval.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 결재 관련 DTO 클래스 모음
 */
public class ApprovalDto {
    
    // private constructor to hide the implicit public one
    private ApprovalDto() {
        // utility class
    }

    /**
     * 결재 상신 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRequest {
        private String taskTypeCd;          // 업무 유형 코드
        private Long taskId;                // 업무 ID
        private String taskTitle;           // 업무 제목
        private String requesterId;         // 요청자 ID
        private List<String> approvers;     // 결재자 목록 (순서대로)
        private String urgency;             // 긴급도 (NORMAL, URGENT)
        private String comments;            // 결재 요청 사유
    }

    /**
     * 결재 처리 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessRequest {
        private Long stepId;                // 결재 단계 ID
        private String action;              // 처리 액션 (approve, reject)
        private String comments;            // 처리 의견
    }

    /**
     * 결재 상태 조회 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusResponse {
        private Long approvalId;            // 결재 ID
        private String taskTypeCd;          // 업무 유형 코드
        private Long taskId;                // 업무 ID
        private String taskTitle;           // 업무 제목
        private String requesterId;         // 요청자 ID
        private String requesterName;       // 요청자 명
        private String status;              // 전체 상태
        private String statusName;          // 상태명
        private Integer currentStep;        // 현재 단계
        private Integer totalSteps;         // 전체 단계
        private LocalDateTime requestDateTime; // 요청 일시
        private LocalDateTime approvalDateTime; // 완료 일시
        private String comments;            // 전체 의견
        private String urgency;             // 긴급도
        private List<StepInfo> steps;       // 단계 정보 목록
    }

    /**
     * 결재 단계 정보 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepInfo {
        private Long stepId;                // 단계 ID
        private Integer stepOrder;          // 단계 순서
        private String approverId;          // 결재자 ID
        private String approverName;        // 결재자 명
        private String status;              // 단계 상태
        private String statusName;          // 상태명
        private LocalDateTime approvedDateTime; // 처리 일시
        private String comments;            // 처리 의견
        private Boolean isCurrentUser;      // 현재 사용자 여부
    }

    /**
     * 결재 목록 조회 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private Long approvalId;            // 결재 ID
        private String taskTypeCd;          // 업무 유형 코드
        private String taskTypeName;        // 업무 유형명
        private Long taskId;                // 업무 ID
        private String taskTitle;           // 업무 제목
        private String requesterId;         // 요청자 ID
        private String requesterName;       // 요청자 명
        private String status;              // 전체 상태
        private String statusName;          // 상태명
        private Integer currentStep;        // 현재 단계
        private Integer totalSteps;         // 전체 단계
        private String currentApproverName; // 현재 결재자명
        private LocalDateTime requestDateTime; // 요청 일시
        private String urgency;             // 긴급도
        private Boolean isMyTask;           // 내 담당 여부
    }

    /**
     * 결재 대시보드 요약 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResponse {
        private Long totalCount;            // 전체 건수
        private Long pendingCount;          // 대기 건수
        private Long inProgressCount;       // 진행 건수
        private Long approvedCount;         // 승인 건수
        private Long rejectedCount;         // 반려 건수
        private Long cancelledCount;        // 취소 건수
        private Double avgProcessingHours;  // 평균 처리 시간(시간)
        private Long myPendingCount;        // 내 결재 대기 건수
    }

    /**
     * 결재자 선택 정보 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApproverInfo {
        private String userId;              // 사용자 ID
        private String userName;            // 사용자명
        private String departmentName;      // 부서명
        private String positionName;        // 직책명
        private Boolean isAvailable;       // 결재 가능 여부
    }

    /**
     * 결재 이력 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoryResponse {
        private Long approvalId;            // 결재 ID
        private String taskTypeName;        // 업무 유형명
        private String taskTitle;           // 업무 제목
        private String requesterName;       // 요청자명
        private String myAction;            // 내가 한 처리
        private LocalDateTime myActionDateTime; // 내 처리 일시
        private String myComments;          // 내 처리 의견
        private String finalStatus;         // 최종 상태
        private LocalDateTime finalDateTime; // 최종 처리 일시
        private Integer myStepOrder;        // 내 결재 순서
        private Integer totalSteps;         // 전체 단계
    }

    /**
     * 결재 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticsResponse {
        private String period;              // 기간
        private String taskTypeName;        // 업무 유형명
        private Long totalCount;            // 전체 건수
        private Long approvedCount;         // 승인 건수
        private Long rejectedCount;         // 반려 건수
        private Double approvalRate;        // 승인율
        private Double avgProcessingHours;  // 평균 처리 시간
        private Long delayedCount;          // 지연 건수
    }

    /**
     * 결재 상신 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitResponse {
        private Long approvalId;            // 생성된 결재 ID
        private String status;              // 상신 결과 상태
        private String message;             // 결과 메시지
        private List<StepInfo> steps;       // 생성된 결재 단계
    }

    /**
     * 결재 처리 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessResponse {
        private Long approvalId;            // 결재 ID
        private String status;              // 처리 결과 상태
        private String message;             // 결과 메시지
        private Integer nextStep;           // 다음 단계 (있는 경우)
        private String nextApproverName;    // 다음 결재자명 (있는 경우)
        private Boolean isCompleted;        // 전체 완료 여부
    }
}