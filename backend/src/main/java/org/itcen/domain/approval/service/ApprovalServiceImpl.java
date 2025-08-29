package org.itcen.domain.approval.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.itcen.domain.approval.dto.ApprovalDto;
import org.itcen.domain.approval.entity.Approval;
import org.itcen.domain.approval.entity.ApprovalStep;
import org.itcen.domain.approval.repository.ApprovalRepository;
import org.itcen.domain.approval.repository.ApprovalStepRepository;
import org.itcen.domain.user.entity.User;
import org.itcen.domain.user.repository.UserRepository;
import org.itcen.domain.employee.entity.Employee;
import org.itcen.domain.audit.repository.AuditProgMngtDetailRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 결재 서비스 구현체
 * 
 * SOLID 원칙:
 * - 단일 책임: 결재 비즈니스 로직만 구현
 * - 개방-폐쇄: 새로운 기능 추가 시 기존 코드 수정 없이 확장
 * - 리스코프 치환: ApprovalService 인터페이스 완전 구현
 * - 인터페이스 분리: 결재 관련 기능만 구현
 * - 의존성 역전: Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final UserRepository userRepository;
    private final AuditProgMngtDetailRepository auditProgMngtDetailRepository;

    @Override
    @Transactional
    public ApprovalDto.SubmitResponse submitApproval(ApprovalDto.SubmitRequest request) {
        log.info("결재 상신 요청: taskType={}, taskId={}, requesterId={}, approvers={}", 
                request.getTaskTypeCd(), request.getTaskId(), request.getRequesterId(), request.getApprovers());

        try {
            // 기존 결재 중복 확인
            validateDuplicateApproval(request.getTaskTypeCd(), request.getTaskId());

            // 결재자 유효성 검증
            validateApprovers(request.getApprovers());

            // 결재 생성
            log.info("결재 엔티티 생성 전 requesterId: {}, urgency: {}", request.getRequesterId(), request.getUrgency());
            Approval approval = Approval.createApproval(
                request.getTaskTypeCd(),
                request.getTaskId(),
                request.getRequesterId(),
                request.getApprovers(),
                request.getUrgency()
            );
            log.info("결재 엔티티 생성 후 requesterId: {}, urgency: {}", approval.getRequesterId(), approval.getUrgencyCd());

            if (request.getComments() != null) {
                approval.setComments(request.getComments());
            }

            // 임시로 단계 목록 저장
            List<ApprovalStep> tempSteps = new ArrayList<>(approval.getSteps());
            // 결재 먼저 저장 (단계 없이)
            approval.getSteps().clear();
            Approval savedApproval = approvalRepository.save(approval);

            // 결재 단계에 approval_id 설정 후 저장
            for (ApprovalStep step : tempSteps) {
                step.setApprovalId(savedApproval.getApprovalId());
                step.setApproval(savedApproval);
                approvalStepRepository.save(step);
                savedApproval.getSteps().add(step);
            }

            log.info("결재 상신 완료: approvalId={}", savedApproval.getApprovalId());

            return ApprovalDto.SubmitResponse.builder()
                    .approvalId(savedApproval.getApprovalId())
                    .status("SUCCESS")
                    .message("결재가 성공적으로 상신되었습니다.")
                    .steps(convertToStepInfoList(savedApproval.getSteps(), null))
                    .build();

        } catch (Exception e) {
            log.error("결재 상신 실패: {}", e.getMessage(), e);
            throw new RuntimeException("결재 상신에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApprovalDto.ProcessResponse processApproval(ApprovalDto.ProcessRequest request) {
        log.info("결재 처리 요청: stepId={}, action={}", request.getStepId(), request.getAction());

        try {
            // 결재 단계 조회
            ApprovalStep step = approvalStepRepository.findById(request.getStepId())
                    .orElseThrow(() -> new RuntimeException("결재 단계를 찾을 수 없습니다."));

            // 처리 권한 확인
            validateProcessAuthority(step);

            // 결재 처리
            if ("approve".equals(request.getAction())) {
                step.approve(request.getComments());
            } else if ("reject".equals(request.getAction())) {
                step.reject(request.getComments());
            } else {
                throw new RuntimeException("잘못된 처리 액션입니다: " + request.getAction());
            }

            // 결재 전체 상태 업데이트
            Approval approval = step.getApproval();
            updateApprovalStatus(approval, step);

            log.info("결재 처리 완료: stepId={}, action={}, approvalStatus={}", 
                    request.getStepId(), request.getAction(), approval.getApprStatCd());

            return buildProcessResponse(approval, step);

        } catch (Exception e) {
            log.error("결재 처리 실패: {}", e.getMessage(), e);
            throw new RuntimeException("결재 처리에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApprovalDto.ProcessResponse cancelApproval(Long approvalId, String requesterId) {
        log.info("결재 취소 요청: approvalId={}, requesterId={}", approvalId, requesterId);

        try {
            // 결재 조회
            Approval approval = approvalRepository.findById(approvalId)
                    .orElseThrow(() -> new RuntimeException("결재를 찾을 수 없습니다."));

            // 취소 권한 확인
            if (!approval.getRequesterId().equals(requesterId)) {
                throw new RuntimeException("결재 취소 권한이 없습니다.");
            }

            // 취소 가능 여부 확인
            if (!approval.isCancellable()) {
                throw new RuntimeException("이미 승인된 결재는 취소할 수 없습니다.");
            }

            // 결재 취소
            approval.cancel();
            approvalRepository.save(approval);

            log.info("결재 취소 완료: approvalId={}", approvalId);

            return ApprovalDto.ProcessResponse.builder()
                    .approvalId(approvalId)
                    .status("CANCELLED")
                    .message("결재가 성공적으로 취소되었습니다.")
                    .isCompleted(true)
                    .build();

        } catch (Exception e) {
            log.error("결재 취소 실패: {}", e.getMessage(), e);
            throw new RuntimeException("결재 취소에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    public ApprovalDto.StatusResponse getApprovalStatus(String taskTypeCd, Long taskId) {
        return approvalRepository.findByTaskWithSteps(taskTypeCd, taskId)
                .map(this::convertToStatusResponse)
                .orElse(null);
    }

    @Override
    public ApprovalDto.StatusResponse getApprovalDetail(Long approvalId) {
        return approvalRepository.findByIdWithSteps(approvalId)
                .map(this::convertToStatusResponse)
                .orElse(null); // Exception 대신 null 반환
    }

    @Override
    public List<ApprovalDto.ListResponse> getMyPendingApprovals(String approverId) {
        return approvalRepository.findPendingApprovalsByApprover(approverId)
                .stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalDto.ListResponse> getMyRequestedApprovals(String requesterId) {
        return approvalRepository.findByRequesterId(requesterId)
                .stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalDto.HistoryResponse> getMyApprovalHistory(String approverId) {
        return approvalStepRepository.findProcessedStepsByApprover(approverId)
                .stream()
                .map(this::convertToHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalDto.ListResponse> getAllApprovals() {
        return approvalRepository.findAllWithSteps()
                .stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ApprovalDto.SummaryResponse getApprovalSummary(String userId) {
        // 전체 통계
        List<Object[]> statusStats = approvalRepository.getApprovalStatusStatistics();
        
        // 내 결재 대기 건수
        long myPendingCount = approvalRepository.findPendingApprovalsByApprover(userId).size();

        return buildSummaryResponse(statusStats, myPendingCount);
    }

    @Override
    public List<ApprovalDto.ApproverInfo> getAvailableApprovers() {
        log.info("결재자 목록 조회 시작");
        
        try {
            // 사용자와 직원 정보를 조인하여 조회
            List<Object[]> usersWithEmployee = userRepository.findUsersWithEmployee();
            log.info("조회된 사용자 수: {}", usersWithEmployee.size());
            
            List<ApprovalDto.ApproverInfo> approvers = usersWithEmployee.stream()
                .map(this::convertToApproverInfo)
                .filter(approver -> Boolean.TRUE.equals(approver.getIsAvailable())) // 사용 가능한 결재자만 필터링
                .collect(Collectors.toList());
                
            log.info("필터링 후 결재자 수: {}", approvers.size());
            return approvers;
                
        } catch (Exception e) {
            log.error("결재자 목록 조회 실패: {}", e.getMessage(), e);
            // 오류 발생 시 빈 리스트 반환
            return List.of();
        }
    }
    
    /**
     * User와 Employee 정보를 ApproverInfo DTO로 변환
     */
    private ApprovalDto.ApproverInfo convertToApproverInfo(Object[] userEmployeeData) {
        User user = (User) userEmployeeData[0];
        Employee employee = (Employee) userEmployeeData[1];
        
        return ApprovalDto.ApproverInfo.builder()
                .userId(user.getId())
                .userName(employee != null ? employee.getEmpName() : user.getEmpNo())
                .departmentName(employee != null ? employee.getDeptName() : "미지정")
                .positionName(employee != null ? employee.getPositionName() : "미지정")
                .isAvailable(employee == null || employee.isUsable()) // employee가 null이거나 사용가능한 경우
                .build();
    }

    @Override
    public List<ApprovalDto.StatisticsResponse> getApprovalStatistics(String taskTypeCd) {
        // TODO: 통계 로직 구현
        return List.of();
    }

    @Override
    public List<ApprovalDto.ListResponse> getDelayedApprovals(Integer days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return approvalRepository.findDelayedApprovals(cutoffDate)
                .stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasApprovalAuthority(String approverId, String taskTypeCd, Long taskId) {
        return approvalStepRepository.findPendingStepByApproverAndTask(approverId, taskTypeCd, taskId)
                .isPresent();
    }

    @Override
    public List<ApprovalDto.StepInfo> previewApprovalLine(List<String> approvers) {
        return approvers.stream()
                .map(approverId -> ApprovalDto.StepInfo.builder()
                        .stepOrder(approvers.indexOf(approverId) + 1)
                        .approverId(approverId)
                        .approverName(getUserName(approverId)) // TODO: 사용자명 조회
                        .status(approvers.indexOf(approverId) == 0 ? "PENDING" : "WAITING")
                        .statusName(approvers.indexOf(approverId) == 0 ? "결재대기" : "순서대기")
                        .build())
                .collect(Collectors.toList());
    }

    // === Private Helper Methods ===

    private void validateDuplicateApproval(String taskTypeCd, Long taskId) {
        approvalRepository.findByTaskTypeCdAndTaskId(taskTypeCd, taskId)
                .ifPresent(approval -> {
                    if (!Approval.Status.REJECTED.equals(approval.getApprStatCd()) && 
                        !Approval.Status.CANCELLED.equals(approval.getApprStatCd())) {
                        throw new RuntimeException("이미 진행 중인 결재가 있습니다.");
                    }
                });
    }

    private void validateApprovers(List<String> approvers) {
        if (approvers == null || approvers.isEmpty()) {
            throw new RuntimeException("결재자가 지정되지 않았습니다.");
        }
        if (approvers.size() > 3) {
            throw new RuntimeException("결재자는 최대 3명까지 지정할 수 있습니다.");
        }
        // TODO: 결재자 유효성 검증 (사용자 존재 여부, 권한 등)
    }

    private void validateProcessAuthority(ApprovalStep step) {
        if (!step.isPending()) {
            throw new RuntimeException("처리할 수 없는 결재 단계입니다.");
        }
        // TODO: 결재자 권한 추가 검증
    }

    private void updateApprovalStatus(Approval approval, ApprovalStep processedStep) {
        if (processedStep.isRejected()) {
            // 반려 시 전체 결재 반려
            approval.reject();
        } else if (processedStep.isApproved()) {
            // 승인 시 다음 단계 확인
            if (!approval.activateNextStep(processedStep.getStepOrder())) {
                // 마지막 단계면 전체 승인 완료
                if (approval.isAllStepsCompleted()) {
                    approval.complete();
                    
                    // 최종 승인 완료 시 audit_prog_mngt_detail 테이블 업데이트
                    if ("audit_prog_mngt_detail".equals(approval.getTaskTypeCd())) {
                        try {
                            int updatedCount = auditProgMngtDetailRepository.updateImpPlStatusToPLI03(approval.getTaskId());
                            log.info("audit_prog_mngt_detail 업데이트 완료: taskId={}, updatedCount={}", 
                                    approval.getTaskId(), updatedCount);
                        } catch (Exception e) {
                            log.error("audit_prog_mngt_detail 업데이트 실패: taskId={}, error={}", 
                                    approval.getTaskId(), e.getMessage(), e);
                            // 업데이트 실패해도 결재는 완료 상태 유지 (비즈니스 요구사항에 따라 조정 가능)
                        }
                    }
                }
            }
        }
    }

    private ApprovalDto.ProcessResponse buildProcessResponse(Approval approval, ApprovalStep step) {
        ApprovalDto.ProcessResponse.ProcessResponseBuilder builder = ApprovalDto.ProcessResponse.builder()
                .approvalId(approval.getApprovalId())
                .status(approval.getApprStatCd())
                .isCompleted(Approval.Status.APPROVED.equals(approval.getApprStatCd()) || 
                            Approval.Status.REJECTED.equals(approval.getApprStatCd()));

        if (step.isApproved()) {
            Integer nextStep = approval.getCurrentStep();
            if (nextStep != null) {
                ApprovalStep nextStepEntity = approval.getStep(nextStep);
                builder.nextStep(nextStep)
                       .nextApproverName(getUserName(nextStepEntity.getApproverId()))
                       .message("승인 처리되었습니다. " + nextStep + "차 결재자에게 전달됩니다.");
            } else {
                builder.message("최종 승인 완료되었습니다.");
            }
        } else if (step.isRejected()) {
            builder.message("반려 처리되었습니다.");
        }

        return builder.build();
    }

    private ApprovalDto.StatusResponse convertToStatusResponse(Approval approval) {
        return ApprovalDto.StatusResponse.builder()
                .approvalId(approval.getApprovalId())
                .taskTypeCd(approval.getTaskTypeCd())
                .taskId(approval.getTaskId())
                .taskTitle(getTaskTitle(approval.getTaskTypeCd(), approval.getTaskId()))
                .requesterId(approval.getRequesterId())
                .requesterName(getUserName(approval.getRequesterId()))
                .status(approval.getApprStatCd())
                .statusName(getStatusName(approval.getApprStatCd()))
                .currentStep(approval.getCurrentStep())
                .totalSteps(approval.getTotalSteps())
                .requestDateTime(approval.getRequestDatetime())
                .approvalDateTime(approval.getApprovalDatetime())
                .comments(approval.getComments())
                .urgency(approval.getUrgencyCd())
                .steps(convertToStepInfoList(approval.getSteps(), null))
                .build();
    }

    private ApprovalDto.ListResponse convertToListResponse(Approval approval) {
        return ApprovalDto.ListResponse.builder()
                .approvalId(approval.getApprovalId())
                .taskTypeCd(approval.getTaskTypeCd())
                .taskTypeName(getTaskTypeName(approval.getTaskTypeCd()))
                .taskId(approval.getTaskId())
                .taskTitle(getTaskTitle(approval.getTaskTypeCd(), approval.getTaskId()))
                .requesterId(approval.getRequesterId())
                .requesterName(getUserName(approval.getRequesterId()))
                .status(approval.getApprStatCd())
                .statusName(getStatusName(approval.getApprStatCd()))
                .currentStep(approval.getCurrentStep())
                .totalSteps(approval.getTotalSteps())
                .requestDateTime(approval.getRequestDatetime())
                .urgency(approval.getUrgencyCd())
                .build();
    }

    private ApprovalDto.HistoryResponse convertToHistoryResponse(ApprovalStep step) {
        return ApprovalDto.HistoryResponse.builder()
                .approvalId(step.getApprovalId())
                .taskTypeName(getTaskTypeName(step.getApproval().getTaskTypeCd()))
                .taskTitle(getTaskTitle(step.getApproval().getTaskTypeCd(), step.getApproval().getTaskId()))
                .requesterName(getUserName(step.getApproval().getRequesterId()))
                .myAction(step.getStepStatus())
                .myActionDateTime(step.getApprovedDatetime())
                .myComments(step.getComments())
                .finalStatus(step.getApproval().getApprStatCd())
                .finalDateTime(step.getApproval().getApprovalDatetime())
                .myStepOrder(step.getStepOrder())
                .totalSteps(step.getApproval().getTotalSteps())
                .build();
    }

    private List<ApprovalDto.StepInfo> convertToStepInfoList(List<ApprovalStep> steps, String currentUserId) {
        return steps.stream()
                .map(step -> ApprovalDto.StepInfo.builder()
                        .stepId(step.getStepId())
                        .stepOrder(step.getStepOrder())
                        .approverId(step.getApproverId())
                        .approverName(getUserName(step.getApproverId()))
                        .status(step.getStepStatus())
                        .statusName(getStatusName(step.getStepStatus()))
                        .approvedDateTime(step.getApprovedDatetime())
                        .comments(step.getComments())
                        .isCurrentUser(step.getApproverId().equals(currentUserId))
                        .build())
                .collect(Collectors.toList());
    }

    private ApprovalDto.SummaryResponse buildSummaryResponse(List<Object[]> statusStats, long myPendingCount) {
        ApprovalDto.SummaryResponse.SummaryResponseBuilder builder = ApprovalDto.SummaryResponse.builder()
                .myPendingCount(myPendingCount);

        long total = 0, pending = 0, inProgress = 0, approved = 0, rejected = 0, cancelled = 0;

        for (Object[] stat : statusStats) {
            String status = (String) stat[0];
            Long count = (Long) stat[1];
            total += count;

            switch (status) {
                case "SUBMITTED": pending += count; break;
                case "IN_PROGRESS": inProgress += count; break;
                case "APPROVED": approved += count; break;
                case "REJECTED": rejected += count; break;
                case "CANCELLED": cancelled += count; break;
            }
        }

        return builder
                .totalCount(total)
                .pendingCount(pending)
                .inProgressCount(inProgress)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .cancelledCount(cancelled)
                .build();
    }

    // TODO: 실제 구현 시 사용자 서비스와 연동
    private String getUserName(String userId) {
        try {
            // User를 조회하여 Employee 정보에서 이름 가져오기
            User user = userRepository.findByEmpNo(userId).orElse(null);
            if (user != null) {
                // UserRepository에서 Employee JOIN 쿼리로 이름 조회
                Object[] userEmployee = userRepository.findUsersWithEmployee().stream()
                    .filter(data -> ((User) data[0]).getId().equals(user.getId()))
                    .findFirst()
                    .orElse(null);
                    
                if (userEmployee != null && userEmployee[1] != null) {
                    return ((org.itcen.domain.employee.entity.Employee) userEmployee[1]).getEmpName();
                }
            }
            return userId; // fallback으로 ID 반환
        } catch (Exception e) {
            log.warn("사용자명 조회 실패: {}", userId, e);
            return userId; // 에러 시 ID 반환
        }
    }

    // TODO: 실제 구현 시 업무 타입별 제목 조회 로직
    private String getTaskTitle(String taskTypeCd, Long taskId) {
        return taskTypeCd + " - " + taskId; // 임시
    }

    // TODO: 실제 구현 시 공통코드와 연동
    private String getTaskTypeName(String taskTypeCd) {
        return taskTypeCd; // 임시
    }

    private String getStatusName(String status) {
        switch (status) {
            case "SUBMITTED": return "상신완료";
            case "IN_PROGRESS": return "결재진행중";
            case "APPROVED": return "승인완료";
            case "REJECTED": return "반려";
            case "CANCELLED": return "상신취소";
            case "PENDING": return "결재대기";
            case "WAITING": return "순서대기";
            case "SKIPPED": return "건너뜀";
            default: return status;
        }
    }
}