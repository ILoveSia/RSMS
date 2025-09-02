package org.itcen.domain.main.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.main.dto.*;
import org.itcen.domain.main.service.MainDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 메인 대시보드 컨트롤러
 * 
 * 메인 대시보드의 실시간 데이터 제공을 위한 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: HTTP 요청/응답 처리만 담당
 * - Open/Closed: 새로운 엔드포인트 추가 시 확장 가능
 * - Liskov Substitution: Controller 규약 준수
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/main")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class MainDashboardController {

    private final MainDashboardService mainDashboardService;

    /**
     * 사용자별 업무 통계 조회
     * 
     * @param userId 사용자 ID
     * @return 업무 통계 정보
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<WorkStatsDto> getWorkStats(@PathVariable String userId) {
        log.info("사용자별 업무 통계 조회 요청: userId={}", userId);
        
        try {
            WorkStatsDto workStats = mainDashboardService.getWorkStats(userId);
            log.info("사용자별 업무 통계 조회 성공: userId={}, stats={}", userId, workStats);
            return ResponseEntity.ok(workStats);
            
        } catch (Exception e) {
            log.error("사용자별 업무 통계 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자별 월별 트렌드 데이터 조회
     * 
     * @param userId 사용자 ID
     * @return 월별 트렌드 데이터 리스트
     */
    @GetMapping("/trends/{userId}")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrends(@PathVariable String userId) {
        log.info("사용자별 월별 트렌드 조회 요청: userId={}", userId);
        
        try {
            List<MonthlyTrendDto> trends = mainDashboardService.getMonthlyTrends(userId);
            log.info("사용자별 월별 트렌드 조회 성공: userId={}, count={}", userId, trends.size());
            return ResponseEntity.ok(trends);
            
        } catch (Exception e) {
            log.error("사용자별 월별 트렌드 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자별 최근 완료 업무 조회
     * 
     * @param userId 사용자 ID
     * @return 최근 완료 업무 리스트
     */
    @GetMapping("/recent-tasks/{userId}")
    public ResponseEntity<List<RecentTaskDto>> getRecentTasks(@PathVariable String userId) {
        log.info("사용자별 최근 완료 업무 조회 요청: userId={}", userId);
        
        try {
            List<RecentTaskDto> recentTasks = mainDashboardService.getRecentTasks(userId);
            log.info("사용자별 최근 완료 업무 조회 성공: userId={}, count={}", userId, recentTasks.size());
            return ResponseEntity.ok(recentTasks);
            
        } catch (Exception e) {
            log.error("사용자별 최근 완료 업무 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자별 전체 워크플로우 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 워크플로우 프로세스 현황 리스트
     */
    @GetMapping("/workflow-processes/{userId}")
    public ResponseEntity<List<UserWorkflowProcessStatusDto>> getUserWorkflowProcesses(@PathVariable String userId) {
        log.info("사용자별 전체 워크플로우 프로세스 조회 요청: userId={}", userId);
        
        try {
            List<UserWorkflowProcessStatusDto> processes = mainDashboardService.getUserWorkflowProcesses(userId);
            log.info("사용자별 전체 워크플로우 프로세스 조회 성공: userId={}, count={}", userId, processes.size());
            return ResponseEntity.ok(processes);
            
        } catch (Exception e) {
            log.error("사용자별 전체 워크플로우 프로세스 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자별 결재 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 결재 프로세스 현황
     */
    @GetMapping("/approval-process/{userId}")
    public ResponseEntity<UserWorkflowProcessStatusDto> getApprovalProcessStatus(@PathVariable String userId) {
        log.info("사용자별 결재 프로세스 조회 요청: userId={}", userId);
        
        try {
            UserWorkflowProcessStatusDto process = mainDashboardService.getApprovalProcessStatus(userId);
            
            if (process != null) {
                log.info("사용자별 결재 프로세스 조회 성공: userId={}, process={}", userId, process.getProcessName());
                return ResponseEntity.ok(process);
            } else {
                log.info("사용자별 결재 프로세스 없음: userId={}", userId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("사용자별 결재 프로세스 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자별 점검 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 점검 프로세스 현황
     */
    @GetMapping("/audit-process/{userId}")
    public ResponseEntity<UserWorkflowProcessStatusDto> getAuditProcessStatus(@PathVariable String userId) {
        log.info("사용자별 점검 프로세스 조회 요청: userId={}", userId);
        
        try {
            UserWorkflowProcessStatusDto process = mainDashboardService.getAuditProcessStatus(userId);
            
            if (process != null) {
                log.info("사용자별 점검 프로세스 조회 성공: userId={}, process={}", userId, process.getProcessName());
                return ResponseEntity.ok(process);
            } else {
                log.info("사용자별 점검 프로세스 없음: userId={}", userId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("사용자별 점검 프로세스 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 사용자별 원장관리 프로세스 현황 조회
     * 
     * @param userId 사용자 ID
     * @return 원장관리 프로세스 현황
     */
    @GetMapping("/management-process/{userId}")
    public ResponseEntity<UserWorkflowProcessStatusDto> getManagementProcessStatus(@PathVariable String userId) {
        log.info("사용자별 원장관리 프로세스 조회 요청: userId={}", userId);
        
        try {
            UserWorkflowProcessStatusDto process = mainDashboardService.getManagementProcessStatus(userId);
            
            if (process != null) {
                log.info("사용자별 원장관리 프로세스 조회 성공: userId={}, process={}", userId, process.getProcessName());
                return ResponseEntity.ok(process);
            } else {
                log.info("사용자별 원장관리 프로세스 없음: userId={}", userId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("사용자별 원장관리 프로세스 조회 실패: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 ledger_orders_id에 해당하는 부서장 내부통제 상태 조회
     * 
     * @param ledgerOrdersId 원장오더 ID
     * @return 부서장 내부통제 상태 정보
     */
    @GetMapping("/ledger-orders-hod-status/{ledgerOrdersId}")
    public ResponseEntity<LedgerOrdersHodStatusDto> getLedgerOrdersHodStatus(@PathVariable Long ledgerOrdersId) {
        log.info("부서장 내부통제 상태 조회 요청: ledgerOrdersId={}", ledgerOrdersId);
        
        try {
            LedgerOrdersHodStatusDto hodStatus = mainDashboardService.getLedgerOrdersHodStatus(ledgerOrdersId);
            log.info("부서장 내부통제 상태 조회 성공: ledgerOrdersId={}, status={}", ledgerOrdersId, hodStatus.getLedgerOrdersHodStatusName());
            return ResponseEntity.ok(hodStatus);
            
        } catch (Exception e) {
            log.error("부서장 내부통제 상태 조회 실패: ledgerOrdersId={}", ledgerOrdersId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 ledger_orders_id에 해당하는 점검 통계 조회
     * 
     * @param ledgerOrdersId 원장오더 ID
     * @return 점검 통계 정보
     */
    @GetMapping("/audit-statistics/{ledgerOrdersId}")
    public ResponseEntity<AuditStatisticsDto> getAuditStatistics(@PathVariable Long ledgerOrdersId) {
        log.info("점검 통계 조회 요청: ledgerOrdersId={}", ledgerOrdersId);
        
        try {
            AuditStatisticsDto auditStats = mainDashboardService.getAuditStatistics(ledgerOrdersId);
            log.info("점검 통계 조회 성공: ledgerOrdersId={}, totalCount={}", ledgerOrdersId, auditStats.getTotalCount());
            return ResponseEntity.ok(auditStats);
            
        } catch (Exception e) {
            log.error("점검 통계 조회 실패: ledgerOrdersId={}", ledgerOrdersId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}