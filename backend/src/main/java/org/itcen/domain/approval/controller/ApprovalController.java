package org.itcen.domain.approval.controller;

import java.util.List;

import org.itcen.domain.approval.dto.ApprovalDto;
import org.itcen.domain.approval.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 결재 REST API 컨트롤러
 * 
 * SOLID 원칙:
 * - 단일 책임: HTTP 요청/응답 처리만 담당
 * - 개방-폐쇄: 새로운 API 추가 시 기존 코드 수정 없이 확장
 * - 리스코프 치환: REST API 표준 준수
 * - 인터페이스 분리: 결재 관련 API만 정의
 * - 의존성 역전: ApprovalService 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/approval-system")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    
    @Autowired
    private RequestMappingHandlerMapping requestMappingHandlerMapping;
    /**
     * 결재 상신
     * 
     * POST /api/approval/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<ApprovalDto.SubmitResponse> submitApproval(
            @RequestBody ApprovalDto.SubmitRequest request) {
        
        log.info("결재 상신 API 호출: taskType={}, taskId={}", 
                request.getTaskTypeCd(), request.getTaskId());
        
        try {
            ApprovalDto.SubmitResponse response = approvalService.submitApproval(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재 상신 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApprovalDto.SubmitResponse.builder()
                            .status("ERROR")
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * 결재 처리 (승인/반려)
     * 
     * PUT /api/approval/process
     */
    @PutMapping("/process")
    public ResponseEntity<ApprovalDto.ProcessResponse> processApproval(
            @RequestBody ApprovalDto.ProcessRequest request) {
        
        log.info("결재 처리 API 호출: stepId={}, action={}", 
                request.getStepId(), request.getAction());
        
        try {
            ApprovalDto.ProcessResponse response = approvalService.processApproval(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재 처리 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApprovalDto.ProcessResponse.builder()
                            .status("ERROR")
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * 결재 취소
     * 
     * DELETE /api/approval/{approvalId}/cancel/{requesterId}
     */
    @DeleteMapping("/{approvalId}/cancel/{requesterId}")
    public ResponseEntity<ApprovalDto.ProcessResponse> cancelApproval(
            @PathVariable Long approvalId,
            @PathVariable String requesterId) {
        
        log.info("결재 취소 API 호출: approvalId={}, requesterId={}", approvalId, requesterId);
        
        try {
            ApprovalDto.ProcessResponse response = approvalService.cancelApproval(approvalId, requesterId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재 취소 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApprovalDto.ProcessResponse.builder()
                            .status("ERROR")
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * 결재 상태 조회 (업무별)
     * 
     * GET /api/approval/status/{taskType}/{taskId}
     */
    @GetMapping("/status/{taskType}/{taskId}")
    public ResponseEntity<ApprovalDto.StatusResponse> getApprovalStatus(
            @PathVariable String taskType,
            @PathVariable Long taskId) {
        
        log.debug("결재 상태 조회 API 호출: taskType={}, taskId={}", taskType, taskId);
        
        try {
            ApprovalDto.StatusResponse response = approvalService.getApprovalStatus(taskType, taskId);
            if (response != null) {
                return ResponseEntity.ok(response);
            } else {
                // 결재 데이터가 없을 경우 "결재 상신 전" 상태로 응답 (404 대신 200 OK)
                ApprovalDto.StatusResponse noApprovalResponse = ApprovalDto.StatusResponse.builder()
                        .taskTypeCd(taskType)
                        .taskId(taskId)
                        .status("NOT_SUBMITTED")
                        .statusName("결재 상신 전")
                        .currentStep(0)
                        .totalSteps(0)
                        .steps(List.of()) // 빈 리스트로 초기화
                        .build();
                return ResponseEntity.ok(noApprovalResponse);
            }
        } catch (Exception e) {
            log.error("결재 상태 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 결재 상세 정보 조회
     * 
     * GET /api/approval/detail/{approvalId}
     */
    @GetMapping("/detail/{approvalId}")
    public ResponseEntity<ApprovalDto.StatusResponse> getApprovalDetail(
            @PathVariable Long approvalId) {
        
        log.debug("결재 상세 조회 API 호출: approvalId={}", approvalId);
        
        try {
            ApprovalDto.StatusResponse response = approvalService.getApprovalDetail(approvalId);
            if (response != null) {
                return ResponseEntity.ok(response);
            } else {
                // 결재 데이터가 없을 경우 "결재 없음" 상태로 응답
                ApprovalDto.StatusResponse noApprovalResponse = ApprovalDto.StatusResponse.builder()
                        .approvalId(approvalId)
                        .status("NOT_FOUND")
                        .statusName("결재 데이터 없음")
                        .currentStep(0)
                        .totalSteps(0)
                        .steps(List.of()) // 빈 리스트로 초기화
                        .build();
                return ResponseEntity.ok(noApprovalResponse);
            }
        } catch (Exception e) {
            log.error("결재 상세 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 내 결재 대기 목록 조회
     * 
     * GET /api/approval/my-pending/{approverId}
     */
    @GetMapping("/my-pending/{approverId}")
    public ResponseEntity<List<ApprovalDto.ListResponse>> getMyPendingApprovals(
            @PathVariable String approverId) {
        
        log.debug("내 결재 대기 목록 조회 API 호출: approverId={}", approverId);
        
        try {
            List<ApprovalDto.ListResponse> response = approvalService.getMyPendingApprovals(approverId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("내 결재 대기 목록 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 내가 요청한 결재 목록 조회
     * 
     * GET /api/approval/my-requests/{requesterId}
     */
    @GetMapping("/my-requests/{requesterId}")
    public ResponseEntity<List<ApprovalDto.ListResponse>> getMyRequestedApprovals(
            @PathVariable String requesterId) {
        
        log.debug("내 요청 결재 목록 조회 API 호출: requesterId={}", requesterId);
        
        try {
            List<ApprovalDto.ListResponse> response = approvalService.getMyRequestedApprovals(requesterId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("내 요청 결재 목록 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 내 결재 처리 이력 조회
     * 
     * GET /api/approval/my-history/{approverId}
     */
    @GetMapping("/my-history/{approverId}")
    public ResponseEntity<List<ApprovalDto.HistoryResponse>> getMyApprovalHistory(
            @PathVariable String approverId) {
        
        log.debug("내 결재 이력 조회 API 호출: approverId={}", approverId);
        
        try {
            List<ApprovalDto.HistoryResponse> response = approvalService.getMyApprovalHistory(approverId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("내 결재 이력 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 전체 결재 목록 조회 (관리자용)
     * 
     * GET /api/approval/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<ApprovalDto.ListResponse>> getAllApprovals() {
        
        log.debug("전체 결재 목록 조회 API 호출");
        
        try {
            List<ApprovalDto.ListResponse> response = approvalService.getAllApprovals();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("전체 결재 목록 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 결재 대시보드 요약 정보 조회
     * 
     * GET /api/approval/summary/{userId}
     */
    @GetMapping("/summary/{userId}")
    public ResponseEntity<ApprovalDto.SummaryResponse> getApprovalSummary(
            @PathVariable String userId) {
        
        log.debug("결재 요약 정보 조회 API 호출: userId={}", userId);
        
        try {
            ApprovalDto.SummaryResponse response = approvalService.getApprovalSummary(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재 요약 정보 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 결재자 목록 조회
     * 
     * GET /api/approval/approvers
     */
    @GetMapping("/approvers")
    public ResponseEntity<List<ApprovalDto.ApproverInfo>> getAvailableApprovers() {
        
        log.info("결재자 목록 조회 API 호출");
        
        try {
            log.info("ApprovalService 호출 시작");
            List<ApprovalDto.ApproverInfo> response = approvalService.getAvailableApprovers();
            log.info("ApprovalService 호출 완료, 결과 수: {}", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재자 목록 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 결재 라인 미리보기
     * 
     * POST /api/approval/preview-line
     */
    @PostMapping("/preview-line")
    public ResponseEntity<List<ApprovalDto.StepInfo>> previewApprovalLine(
            @RequestBody List<String> approvers) {
        
        log.debug("결재 라인 미리보기 API 호출: approvers={}", approvers);
        
        try {
            List<ApprovalDto.StepInfo> response = approvalService.previewApprovalLine(approvers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재 라인 미리보기 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 결재 권한 확인
     * 
     * GET /api/approval/check-authority/{approverId}/{taskType}/{taskId}
     */
    @GetMapping("/check-authority/{approverId}/{taskType}/{taskId}")
    public ResponseEntity<Boolean> checkApprovalAuthority(
            @PathVariable String approverId,
            @PathVariable String taskType,
            @PathVariable Long taskId) {
        
        log.debug("결재 권한 확인 API 호출: approverId={}, taskType={}, taskId={}", 
                approverId, taskType, taskId);
        
        try {
            boolean hasAuthority = approvalService.hasApprovalAuthority(approverId, taskType, taskId);
            return ResponseEntity.ok(hasAuthority);
        } catch (Exception e) {
            log.error("결재 권한 확인 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 지연 결재 목록 조회
     * 
     * GET /api/approval/delayed/{days}
     */
    @GetMapping("/delayed/{days}")
    public ResponseEntity<List<ApprovalDto.ListResponse>> getDelayedApprovals(
            @PathVariable Integer days) {
        
        log.debug("지연 결재 목록 조회 API 호출: days={}", days);
        
        try {
            List<ApprovalDto.ListResponse> response = approvalService.getDelayedApprovals(days);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("지연 결재 목록 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 결재 통계 조회
     * 
     * GET /api/approval/statistics
     * GET /api/approval/statistics/{taskType}
     */
    @GetMapping("/statistics")
    public ResponseEntity<List<ApprovalDto.StatisticsResponse>> getAllStatistics() {
        return getApprovalStatistics(null);
    }
    
    @GetMapping("/statistics/{taskType}")
    public ResponseEntity<List<ApprovalDto.StatisticsResponse>> getApprovalStatisticsByTaskType(
            @PathVariable String taskType) {
        return getApprovalStatistics(taskType);
    }
    
    private ResponseEntity<List<ApprovalDto.StatisticsResponse>> getApprovalStatistics(String taskType) {
        log.debug("결재 통계 조회 API 호출: taskType={}", taskType);
        
        try {
            List<ApprovalDto.StatisticsResponse> response = approvalService.getApprovalStatistics(taskType);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("결재 통계 조회 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}