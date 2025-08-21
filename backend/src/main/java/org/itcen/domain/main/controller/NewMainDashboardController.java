package org.itcen.domain.main.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.main.dto.*;
import org.itcen.domain.main.service.NewMainDashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 새로운 메인 대시보드 컨트롤러
 * 워크플로우, 통계, QnA, 공지사항, 결재 관련 API를 제공합니다.
 */
@Slf4j
@RestController
@RequestMapping("/main")
@RequiredArgsConstructor
public class NewMainDashboardController {
    
    private final NewMainDashboardService newMainDashboardService;

    /**
     * 최신 원장 상태 조회 (MAX ledger_orders_id)
     */
    @GetMapping("/ledger-orders-status")
    public ApiResponse<LedgerOrdersStatusDto> getLedgerOrdersStatus() {
        log.debug("최신 원장 상태 조회 요청");
        LedgerOrdersStatusDto result = newMainDashboardService.getLedgerOrdersStatus();
        return ApiResponse.success(result);
    }

    /**
     * 최신 부서장 내부통제 상태 조회 (MAX ledger_orders_hod_id)
     */
    @GetMapping("/ledger-orders-hod-status")
    public ApiResponse<LedgerOrdersHodStatusDto> getLedgerOrdersHodStatus() {
        log.debug("최신 부서장 내부통제 상태 조회 요청");
        LedgerOrdersHodStatusDto result = newMainDashboardService.getLedgerOrdersHodStatus();
        return ApiResponse.success(result);
    }

    /**
     * 전체 점검 통계 조회 (부서별 집계)
     */
    @GetMapping("/audit-statistics")
    public ApiResponse<AuditStatisticsDto> getAuditStatistics() {
        log.debug("전체 점검 통계 조회 요청");
        AuditStatisticsDto result = newMainDashboardService.getAuditStatistics();
        return ApiResponse.success(result);
    }

    /**
     * 최근 QnA 3건 조회
     */
    @GetMapping("/qna-recent")
    public ApiResponse<List<RecentQnaDto>> getRecentQna() {
        log.debug("최근 QnA 3건 조회 요청");
        List<RecentQnaDto> result = newMainDashboardService.getRecentQna();
        return ApiResponse.success(result);
    }

    /**
     * 최근 공지사항 3건 조회
     */
    @GetMapping("/notice-recent")
    public ApiResponse<List<RecentNoticeDto>> getRecentNotice() {
        log.debug("최근 공지사항 3건 조회 요청");
        List<RecentNoticeDto> result = newMainDashboardService.getRecentNotice();
        return ApiResponse.success(result);
    }

    /**
     * 내 결재 신청 목록 조회
     */
    @GetMapping("/my-approval-requests/{empNo}")
    public ApiResponse<List<MyApprovalRequestDto>> getMyApprovalRequests(@PathVariable String empNo) {
        log.debug("내 결재 신청 목록 조회 요청: empNo={}", empNo);
        List<MyApprovalRequestDto> result = newMainDashboardService.getMyApprovalRequests(empNo);
        return ApiResponse.success(result);
    }

    /**
     * 처리 대기 결재 목록 조회
     */
    @GetMapping("/pending-approvals/{empNo}")
    public ApiResponse<List<PendingApprovalDto>> getPendingApprovals(@PathVariable String empNo) {
        log.debug("처리 대기 결재 목록 조회 요청: empNo={}", empNo);
        List<PendingApprovalDto> result = newMainDashboardService.getPendingApprovals(empNo);
        return ApiResponse.success(result);
    }

    /**
     * 내 결재 신청 목록 조회 (로그인 아이디 기준)
     * 쿼리: SELECT * FROM approval WHERE requester_id = 'testuser' AND appr_stat_cd = 'IN_PROGRESS'
     */
    @GetMapping("/my-approval-requests-by-userid/{userid}")
    public ApiResponse<List<MyApprovalRequestDto>> getMyApprovalRequestsByUserid(@PathVariable String userid) {
        log.debug("내 결재 신청 목록 조회 요청 (로그인 아이디 기준): userid={}", userid);
        List<MyApprovalRequestDto> result = newMainDashboardService.getMyApprovalRequestsByUserid(userid);
        return ApiResponse.success(result);
    }

    /**
     * 처리 대기 결재 목록 조회 (로그인 아이디 기준)
     * 쿼리: SELECT * FROM approval_steps WHERE approver_id = 'bossuser02' AND step_status = 'PENDING'
     */
    @GetMapping("/pending-approvals-by-userid/{userid}")
    public ApiResponse<List<PendingApprovalDto>> getPendingApprovalsByUserid(@PathVariable String userid) {
        log.debug("처리 대기 결재 목록 조회 요청 (로그인 아이디 기준): userid={}", userid);
        List<PendingApprovalDto> result = newMainDashboardService.getPendingApprovalsByUserid(userid);
        return ApiResponse.success(result);
    }
}