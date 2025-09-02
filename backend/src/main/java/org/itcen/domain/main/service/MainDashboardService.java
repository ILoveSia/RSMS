package org.itcen.domain.main.service;

import org.itcen.domain.main.dto.*;

import java.util.List;

/**
 * 메인 대시보드 서비스 인터페이스
 * 
 * SOLID 원칙:
 * - Single Responsibility: 메인 대시보드 관련 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
public interface MainDashboardService {

    /**
     * 사용자별 업무 통계 조회
     * 
     * @param userId 사용자 ID
     * @return 업무 통계 정보
     */
    WorkStatsDto getWorkStats(String userId);

    /**
     * 사용자별 월별 트렌드 데이터 조회
     * 
     * @param userId 사용자 ID
     * @return 월별 트렌드 데이터 리스트
     */
    List<MonthlyTrendDto> getMonthlyTrends(String userId);

    /**
     * 사용자별 최근 완료 업무 조회
     * 
     * @param userId 사용자 ID
     * @return 최근 완료 업무 리스트
     */
    List<RecentTaskDto> getRecentTasks(String userId);

    /**
     * 사용자별 전체 워크플로우 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 워크플로우 프로세스 현황 리스트
     */
    List<UserWorkflowProcessStatusDto> getUserWorkflowProcesses(String userId);

    /**
     * 사용자별 결재 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 결재 프로세스 현황
     */
    UserWorkflowProcessStatusDto getApprovalProcessStatus(String userId);

    /**
     * 사용자별 점검 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 점검 프로세스 현황
     */
    UserWorkflowProcessStatusDto getAuditProcessStatus(String userId);

    /**
     * 사용자별 원장관리 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 원장관리 프로세스 현황
     */
    UserWorkflowProcessStatusDto getManagementProcessStatus(String userId);

    /**
     * 특정 ledger_orders_id에 해당하는 부서장 내부통제 상태 조회
     * 
     * @param ledgerOrdersId 원장오더 ID
     * @return 부서장 내부통제 상태 정보
     */
    LedgerOrdersHodStatusDto getLedgerOrdersHodStatus(Long ledgerOrdersId);

    /**
     * 특정 ledger_orders_id에 해당하는 점검 통계 조회
     * 
     * @param ledgerOrdersId 원장오더 ID
     * @return 점검 통계 정보
     */
    AuditStatisticsDto getAuditStatistics(Long ledgerOrdersId);
}