package org.itcen.domain.main.service;

import org.itcen.domain.main.dto.*;

import java.util.List;

/**
 * 새로운 메인 대시보드 서비스 인터페이스
 * 워크플로우, 통계, QnA, 공지사항, 결재 관련 비즈니스 로직을 정의합니다.
 */
public interface NewMainDashboardService {
    
    /**
     * 최신 원장 상태 조회 (MAX ledger_orders_id)
     */
    LedgerOrdersStatusDto getLedgerOrdersStatus();
    
    /**
     * 최신 부서장 내부통제 상태 조회 (MAX ledger_orders_hod_id)
     */
    LedgerOrdersHodStatusDto getLedgerOrdersHodStatus();
    
    /**
     * 전체 점검 통계 조회 (부서별 집계)
     */
    AuditStatisticsDto getAuditStatistics();
    
    /**
     * 최근 QnA 3건 조회
     */
    List<RecentQnaDto> getRecentQna();
    
    /**
     * 최근 공지사항 3건 조회
     */
    List<RecentNoticeDto> getRecentNotice();
    
    /**
     * 내 결재 신청 목록 조회
     */
    List<MyApprovalRequestDto> getMyApprovalRequests(String empNo);
    
    /**
     * 처리 대기 결재 목록 조회
     */
    List<PendingApprovalDto> getPendingApprovals(String empNo);
    
    /**
     * 내 결재 신청 목록 조회 (로그인 아이디 기준)
     * 쿼리: SELECT * FROM approval WHERE requester_id = 'testuser' AND appr_stat_cd = 'IN_PROGRESS'
     */
    List<MyApprovalRequestDto> getMyApprovalRequestsByUserid(String userid);
    
    /**
     * 처리 대기 결재 목록 조회 (로그인 아이디 기준)
     * 쿼리: SELECT * FROM approval_steps WHERE approver_id = 'bossuser02' AND step_status = 'PENDING'
     */
    List<PendingApprovalDto> getPendingApprovalsByUserid(String userid);
}