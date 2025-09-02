package org.itcen.domain.main.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.approval.repository.ApprovalStepRepository;
import org.itcen.domain.audit.repository.AuditProgMngtRepository;
import org.itcen.domain.main.dto.*;
import org.itcen.domain.positions.repository.LedgerOrdersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 메인 대시보드 서비스 구현체
 * 
 * SOLID 원칙:
 * - Single Responsibility: 메인 대시보드 관련 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: 인터페이스 규약을 완벽히 구현
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: Repository 인터페이스에 의존
 */
@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MainDashboardServiceImpl implements MainDashboardService {

    private final ApprovalStepRepository approvalStepRepository;
    private final AuditProgMngtRepository auditProgMngtRepository;
    private final LedgerOrdersRepository ledgerOrdersRepository;

    @Override
    public WorkStatsDto getWorkStats(String userId) {
        log.debug("사용자별 업무 통계 조회 시작: userId={}", userId);
        
        try {
            // 1. 결재 대기 건수 조회 (NULL 안전 처리)
            Integer approvalPending = approvalStepRepository.countPendingApprovalsByUserId(userId);
            approvalPending = (approvalPending != null) ? approvalPending : 0;
            log.debug("결재 대기 건수: {}", approvalPending);
            
            // 2. 점검 업무 건수 조회 (NULL 안전 처리)
            Integer auditTasks = auditProgMngtRepository.countAuditTasksByUserId(userId);
            auditTasks = (auditTasks != null) ? auditTasks : 0;
            log.debug("점검 업무 건수: {}", auditTasks);
            
            // 3. 원장관리 업무 건수 조회 (NULL 안전 처리)
            Integer managementTasks = ledgerOrdersRepository.countManagementTasksByUserId(userId);
            managementTasks = (managementTasks != null) ? managementTasks : 0;
            log.debug("원장관리 업무 건수: {}", managementTasks);
            
            // 4. 전체 업무 통계 계산 (NULL 안전 처리)
            Integer totalTasks = approvalPending + auditTasks + managementTasks;
            Integer completedTasks = Math.round(totalTasks * 0.7f); // 임시: 70% 완료로 가정
            Integer pendingTasks = totalTasks - completedTasks;
            Integer overdueTasks = Math.round(totalTasks * 0.1f); // 임시: 10% 지연으로 가정
            
            WorkStatsDto result = WorkStatsDto.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .overdueTasks(overdueTasks)
                .approvalPending(approvalPending != null ? approvalPending : 0)
                .auditTasks(auditTasks != null ? auditTasks : 0)
                .build();
            
            log.debug("사용자별 업무 통계 조회 완료: {}", result);
            return result;
            
        } catch (Exception e) {
            log.error("사용자별 업무 통계 조회 실패: userId={}", userId, e);
            // 오류 발생 시 기본값 반환
            return WorkStatsDto.builder()
                .totalTasks(0)
                .completedTasks(0)
                .pendingTasks(0)
                .overdueTasks(0)
                .approvalPending(0)
                .auditTasks(0)
                .build();
        }
    }

    @Override
    public List<MonthlyTrendDto> getMonthlyTrends(String userId) {
        log.debug("사용자별 월별 트렌드 조회 시작: userId={}", userId);
        
        try {
            // 결재 처리 트렌드 조회
            List<Object[]> approvalTrends = approvalStepRepository.getMonthlyApprovalTrendsByUserId(userId);
            
            List<MonthlyTrendDto> result = new ArrayList<>();
            for (Object[] row : approvalTrends) {
                String month = (String) row[0];
                Integer completed = row[1] != null ? ((Number) row[1]).intValue() : 0;
                Integer pending = row[2] != null ? ((Number) row[2]).intValue() : 0;
                Integer total = row[3] != null ? ((Number) row[3]).intValue() : 0;
                
                result.add(MonthlyTrendDto.builder()
                    .month(month)
                    .completed(completed)
                    .pending(pending)
                    .total(total)
                    .build());
            }
            
            // 데이터가 없으면 빈 리스트 반환
            if (result.isEmpty()) {
                log.info("사용자별 월별 트렌드 데이터 없음: userId={}", userId);
                // 빈 리스트 반환 (목업 데이터 제거)
            }
            
            log.debug("사용자별 월별 트렌드 조회 완료: {} 건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("사용자별 월별 트렌드 조회 실패: userId={}", userId, e);
            return Collections.emptyList(); // 목업 데이터 대신 빈 리스트 반환
        }
    }

    @Override
    public List<RecentTaskDto> getRecentTasks(String userId) {
        log.debug("사용자별 최근 완료 업무 조회 시작: userId={}", userId);
        
        try {
            // 최근 완료한 결재 목록 조회 (최대 10건)
            List<org.itcen.domain.approval.entity.ApprovalStep> recentApprovals = 
                approvalStepRepository.getRecentApprovedTasksByUserId(userId);
            
            List<RecentTaskDto> result = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            
            // 최근 3건만 추출하여 변환
            int limit = Math.min(3, recentApprovals.size());
            for (int i = 0; i < limit; i++) {
                var step = recentApprovals.get(i);
                String completedAt = step.getApprovedDatetime() != null ? 
                    formatRelativeTime(step.getApprovedDatetime()) : "알 수 없음";
                
                // 업무 유형 코드를 기반으로 업무명 생성
                String taskName = getTaskNameFromTaskTypeCd(step.getApproval().getTaskTypeCd());
                
                result.add(RecentTaskDto.builder()
                    .taskName(taskName)
                    .completedAt(completedAt)
                    .category("결재")
                    .build());
            }
            
            // 데이터가 부족해도 실제 데이터만 반환 (목업 데이터 제거)
            
            log.debug("사용자별 최근 완료 업무 조회 완료: {} 건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("사용자별 최근 완료 업무 조회 실패: userId={}", userId, e);
            return Collections.emptyList(); // 목업 데이터 대신 빈 리스트 반환
        }
    }

    @Override
    public List<UserWorkflowProcessStatusDto> getUserWorkflowProcesses(String userId) {
        log.debug("사용자별 전체 워크플로우 프로세스 조회 시작: userId={}", userId);
        
        List<UserWorkflowProcessStatusDto> result = new ArrayList<>();
        
        try {
            // 각 프로세스별 현황 조회
            UserWorkflowProcessStatusDto approvalProcess = getApprovalProcessStatus(userId);
            if (approvalProcess != null) {
                result.add(approvalProcess);
            }
            
            UserWorkflowProcessStatusDto auditProcess = getAuditProcessStatus(userId);
            if (auditProcess != null) {
                result.add(auditProcess);
            }
            
            UserWorkflowProcessStatusDto managementProcess = getManagementProcessStatus(userId);
            if (managementProcess != null) {
                result.add(managementProcess);
            }
            
            log.debug("사용자별 전체 워크플로우 프로세스 조회 완료: {} 건", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("사용자별 전체 워크플로우 프로세스 조회 실패: userId={}", userId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public UserWorkflowProcessStatusDto getApprovalProcessStatus(String userId) {
        log.debug("사용자별 결재 프로세스 조회 시작: userId={}", userId);
        
        try {
            List<org.itcen.domain.approval.entity.Approval> currentApprovals = 
                approvalStepRepository.getCurrentApprovalProcessesByUserId(userId);
            
            if (!currentApprovals.isEmpty()) {
                var approval = currentApprovals.get(0); // 가장 우선순위 높은 결재 선택
                
                // 결재 프로세스 단계 정의 (3단계)
                List<WorkflowStepDto> steps = Arrays.asList(
                    WorkflowStepDto.builder()
                        .title("상신")
                        .description("결재 문서 상신")
                        .status("completed")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("진행중")
                        .description("결재라인 검토")
                        .status("active")
                        .dueDate("2024-12-20")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("승인/반려")
                        .description("최종 결재")
                        .status("pending")
                        .build()
                );
                
                return UserWorkflowProcessStatusDto.builder()
                    .processType("approval")
                    .processName("결재 프로세스")
                    .currentStep(1)
                    .totalSteps(3)
                    .progress(50)
                    .activeStepTitle("진행중")
                    .activeStepDescription("결재라인을 통한 단계별 검토 진행")
                    .assignee(userId)
                    .dueDate("2024-12-20")
                    .estimatedTime("1시간")
                    .steps(steps)
                    .build();
            }
            
            return null; // 진행 중인 결재가 없음
            
        } catch (Exception e) {
            log.error("사용자별 결재 프로세스 조회 실패: userId={}", userId, e);
            return null;
        }
    }

    @Override
    public UserWorkflowProcessStatusDto getAuditProcessStatus(String userId) {
        log.debug("사용자별 점검 프로세스 조회 시작: userId={}", userId);
        
        try {
            List<Object[]> auditProcesses = auditProgMngtRepository.getCurrentAuditProcessByUserId(userId);
            
            if (!auditProcesses.isEmpty()) {
                Object[] row = auditProcesses.get(0);
                String processId = (String) row[0];
                String processName = (String) row[1];
                String currentStepTitle = (String) row[2];
                Integer currentStep = ((Number) row[3]).intValue();
                Integer totalSteps = ((Number) row[4]).intValue();
                Integer progress = ((Number) row[5]).intValue();
                String assignee = (String) row[6];
                
                // 점검 프로세스 단계 정의 (6단계)
                List<WorkflowStepDto> steps = Arrays.asList(
                    WorkflowStepDto.builder()
                        .title("계획작성")
                        .description("개선계획 작성")
                        .status(currentStep >= 0 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("계획결재요청")
                        .description("계획 결재 요청")
                        .status(currentStep >= 1 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("계획결재완료")
                        .description("계획 결재 완료")
                        .status(currentStep >= 2 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("이행작성")
                        .description("이행사항 작성")
                        .status(currentStep == 3 ? "active" : (currentStep > 3 ? "completed" : "pending"))
                        .dueDate(currentStep == 3 ? "2024-12-25" : null)
                        .build(),
                    WorkflowStepDto.builder()
                        .title("이행결재요청")
                        .description("이행 결재 요청")
                        .status(currentStep >= 4 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("이행결재완료")
                        .description("이행 결재 완료")
                        .status(currentStep >= 5 ? "completed" : "pending")
                        .build()
                );
                
                return UserWorkflowProcessStatusDto.builder()
                    .processType("audit")
                    .processName("책무구조도 이행 점검")
                    .currentStep(currentStep)
                    .totalSteps(totalSteps)
                    .progress(progress)
                    .activeStepTitle(currentStepTitle)
                    .activeStepDescription("실제 이행사항 작성")
                    .assignee(assignee)
                    .dueDate("2024-12-25")
                    .estimatedTime("4시간")
                    .steps(steps)
                    .build();
            }
            
            return null; // 진행 중인 점검이 없음
            
        } catch (Exception e) {
            log.error("사용자별 점검 프로세스 조회 실패: userId={}", userId, e);
            return null;
        }
    }

    @Override
    public UserWorkflowProcessStatusDto getManagementProcessStatus(String userId) {
        log.debug("사용자별 원장관리 프로세스 조회 시작: userId={}", userId);
        
        try {
            List<Object[]> managementProcesses = ledgerOrdersRepository.getCurrentManagementProcessByUserId(userId);
            
            if (!managementProcesses.isEmpty()) {
                Object[] row = managementProcesses.get(0);
                Long processId = ((Number) row[0]).longValue();
                String processName = (String) row[1];
                String currentStepTitle = (String) row[2];
                Integer currentStep = ((Number) row[3]).intValue();
                Integer totalSteps = ((Number) row[4]).intValue();
                Integer progress = ((Number) row[5]).intValue();
                String assignee = (String) row[6];
                
                // 원장관리 프로세스 단계 정의 (5단계)
                List<WorkflowStepDto> steps = Arrays.asList(
                    WorkflowStepDto.builder()
                        .title("신규")
                        .description("신규 등록")
                        .status(currentStep >= 0 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("직책확정")
                        .description("직책 확정")
                        .status(currentStep >= 1 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("직책별책무확정")
                        .description("책무사항 확정")
                        .status(currentStep >= 2 ? "completed" : "pending")
                        .build(),
                    WorkflowStepDto.builder()
                        .title("임원확정")
                        .description("임원급 승인")
                        .status(currentStep == 3 ? "active" : (currentStep > 3 ? "completed" : "pending"))
                        .dueDate(currentStep == 3 ? "2024-12-28" : null)
                        .build(),
                    WorkflowStepDto.builder()
                        .title("최종확정")
                        .description("최종 승인")
                        .status(currentStep >= 4 ? "completed" : "pending")
                        .build()
                );
                
                return UserWorkflowProcessStatusDto.builder()
                    .processType("management")
                    .processName("책무구조도 원장 관리")
                    .currentStep(currentStep)
                    .totalSteps(totalSteps)
                    .progress(progress)
                    .activeStepTitle(currentStepTitle)
                    .activeStepDescription("임원급 승인 진행")
                    .assignee(assignee)
                    .dueDate("2024-12-28")
                    .estimatedTime("1시간")
                    .steps(steps)
                    .build();
            }
            
            return null; // 진행 중인 원장관리가 없음
            
        } catch (Exception e) {
            log.error("사용자별 원장관리 프로세스 조회 실패: userId={}", userId, e);
            return null;
        }
    }

    @Override
    public LedgerOrdersHodStatusDto getLedgerOrdersHodStatus(Long ledgerOrdersId) {
        log.debug("부서장 내부통제 상태 조회 시작: ledgerOrdersId={}", ledgerOrdersId);
        
        try {
            // 실제 데이터가 없는 경우 기본값 반환 (NULL 안전 처리)
            log.info("부서장 내부통제 상태 조회 - 실제 데이터 없음: ledgerOrdersId={}", ledgerOrdersId);
            
            return LedgerOrdersHodStatusDto.builder()
                .ledgerOrdersId(ledgerOrdersId)
                .ledgerOrdersHodId(0L)
                .ledgerOrdersHodTitle("데이터 없음")
                .ledgerOrdersHodStatusCd("NONE")
                .ledgerOrdersHodStatusName("데이터 없음")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                
        } catch (Exception e) {
            log.error("부서장 내부통제 상태 조회 실패: ledgerOrdersId={}", ledgerOrdersId, e);
            return LedgerOrdersHodStatusDto.builder()
                .ledgerOrdersId(ledgerOrdersId)
                .ledgerOrdersHodId(0L)
                .ledgerOrdersHodTitle("조회 실패")
                .ledgerOrdersHodStatusCd("ERROR")
                .ledgerOrdersHodStatusName("조회 실패")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        }
    }

    @Override
    public AuditStatisticsDto getAuditStatistics(Long ledgerOrdersId) {
        log.debug("점검 통계 조회 시작: ledgerOrdersId={}", ledgerOrdersId);
        
        try {
            // 실제 데이터가 없는 경우 기본값 반환 (NULL 안전 처리)
            log.info("점검 통계 조회 - 실제 데이터 없음: ledgerOrdersId={}", ledgerOrdersId);
            
            return AuditStatisticsDto.builder()
                .totalCount(0)
                .appropriateCount(0)
                .inadequateCount(0)
                .excludedCount(0)
                .appropriateRate(0.0)
                .completionRate(0.0)
                .lastUpdated(LocalDateTime.now())
                .build();
                
        } catch (Exception e) {
            log.error("점검 통계 조회 실패: ledgerOrdersId={}", ledgerOrdersId, e);
            return AuditStatisticsDto.builder()
                .totalCount(0)
                .appropriateCount(0)
                .inadequateCount(0)
                .excludedCount(0)
                .appropriateRate(0.0)
                .completionRate(0.0)
                .lastUpdated(LocalDateTime.now())
                .build();
        }
    }

    // 목업 데이터 메서드들 제거 - 실제 데이터 없으면 빈 값 반환

    /**
     * 상대적 시간 포맷팅
     */
    private String formatRelativeTime(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long hours = java.time.Duration.between(dateTime, now).toHours();
        
        if (hours < 1) {
            return "방금 전";
        } else if (hours < 24) {
            return hours + "시간 전";
        } else if (hours < 24 * 7) {
            return (hours / 24) + "일 전";
        } else {
            return dateTime.format(DateTimeFormatter.ofPattern("MM-dd"));
        }
    }

    /**
     * 업무 유형 코드를 기반으로 업무명 생성
     */
    private String getTaskNameFromTaskTypeCd(String taskTypeCd) {
        if (taskTypeCd == null) {
            return "결재 처리";
        }
        
        switch (taskTypeCd.toLowerCase()) {
            case "responsibility_documents":
            case "resp_doc":
                return "책무기술서 승인";
            case "audit_program":
            case "audit":
                return "점검 계획 승인";
            case "ledger_orders":
            case "ledger":
                return "원장 변경 승인";
            case "position":
                return "직책 변경 승인";
            case "executive":
                return "임원 책무 변경 승인";
            default:
                return "결재 처리 - " + taskTypeCd;
        }
    }
}