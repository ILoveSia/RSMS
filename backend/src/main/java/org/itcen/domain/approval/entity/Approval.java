package org.itcen.domain.approval.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.itcen.common.entity.BaseTimeEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 결재 마스터 엔티티
 * 
 * SOLID 원칙:
 * - 단일 책임: 결재 전체 정보 관리
 * - 개방-폐쇄: 새로운 결재 유형 추가 시 확장 가능
 * - 리스코프 치환: BaseTimeEntity의 모든 동작 지원
 * - 인터페이스 분리: 필요한 기능만 노출
 * - 의존성 역전: 구현체가 아닌 추상화에 의존
 */
@Entity(name = "Approval")
@Table(name = "approval")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Approval extends BaseTimeEntity {

    /**
     * 결재 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_id")
    private Long approvalId;

    /**
     * 업무 유형 코드
     */
    @Column(name = "task_type_cd", nullable = false, length = 100)
    private String taskTypeCd;

    /**
     * 관련 업무 ID
     */
    @Column(name = "task_id", nullable = false)
    private Long taskId;

    /**
     * 결재 요청자 ID
     */
    @Column(name = "requester_id", nullable = false, length = 100)
    private String requesterId;

    /**
     * 결재자 ID (단계별 관리를 위해 nullable)
     */
    @Column(name = "approver_id", length = 100)
    private String approverId;

    /**
     * 결재 상태 코드
     */
    @Builder.Default
    @Column(name = "appr_stat_cd", length = 20)
    private String apprStatCd = "SUBMITTED";

    /**
     * 결재 요청 일시
     */
    @Builder.Default
    @Column(name = "request_datetime")
    private LocalDateTime requestDatetime = LocalDateTime.now();

    /**
     * 결재 완료 일시
     */
    @Column(name = "approval_datetime")
    private LocalDateTime approvalDatetime;

    /**
     * 결재 메모
     */
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    /**
     * 긴급도 (NORMAL: 일반, URGENT: 긴급)
     */
    @Builder.Default
    @Column(name = "urgency_cd", length = 20)
    private String urgencyCd = "NORMAL";

    /**
     * 결재 단계 목록 (양방향 관계)
     */
    @OneToMany(mappedBy = "approval", fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<ApprovalStep> steps = new ArrayList<>();

    /**
     * 결재 전체 상태 열거형
     */
    public static class Status {
        public static final String SUBMITTED = "SUBMITTED";       // 상신완료
        public static final String IN_PROGRESS = "IN_PROGRESS";   // 결재진행중
        public static final String APPROVED = "APPROVED";         // 승인완료
        public static final String REJECTED = "REJECTED";         // 반려
        public static final String CANCELLED = "CANCELLED";       // 상신취소
    }

    /**
     * 긴급도 상수
     */
    public static class Urgency {
        public static final String NORMAL = "NORMAL";            // 일반
        public static final String URGENT = "URGENT";            // 긴급
    }

    /**
     * 결재 단계 추가
     */
    public void addStep(ApprovalStep step) {
        steps.add(step);
        step.setApproval(this);
    }

    /**
     * 결재 진행 중으로 상태 변경
     */
    public void startProgress() {
        this.apprStatCd = Status.IN_PROGRESS;
    }

    /**
     * 결재 승인 완료
     */
    public void complete() {
        this.apprStatCd = Status.APPROVED;
        this.approvalDatetime = LocalDateTime.now();
    }

    /**
     * 결재 반려
     */
    public void reject() {
        this.apprStatCd = Status.REJECTED;
        this.approvalDatetime = LocalDateTime.now();
    }

    /**
     * 결재 취소
     */
    public void cancel() {
        this.apprStatCd = Status.CANCELLED;
        this.approvalDatetime = LocalDateTime.now();
    }

    /**
     * 현재 결재 단계 조회
     */
    public Integer getCurrentStep() {
        return steps.stream()
                .filter(step -> step.isPending())
                .findFirst()
                .map(ApprovalStep::getStepOrder)
                .orElse(null);
    }

    /**
     * 전체 결재 단계 수
     */
    public Integer getTotalSteps() {
        return steps.size();
    }

    /**
     * 특정 단계 조회
     */
    public ApprovalStep getStep(Integer stepOrder) {
        return steps.stream()
                .filter(step -> step.getStepOrder().equals(stepOrder))
                .findFirst()
                .orElse(null);
    }

    /**
     * 다음 단계 활성화
     */
    public boolean activateNextStep(Integer currentStep) {
        ApprovalStep nextStep = getStep(currentStep + 1);
        if (nextStep != null && nextStep.isWaiting()) {
            nextStep.activate();
            this.startProgress();
            return true;
        }
        return false;
    }

    /**
     * 모든 단계가 완료되었는지 확인
     */
    public boolean isAllStepsCompleted() {
        return steps.stream().allMatch(ApprovalStep::isApproved);
    }

    /**
     * 결재가 반려되었는지 확인
     */
    public boolean hasRejectedStep() {
        return steps.stream().anyMatch(ApprovalStep::isRejected);
    }

    /**
     * 취소 가능한지 확인 (아직 승인된 단계가 없어야 함)
     */
    public boolean isCancellable() {
        return steps.stream().noneMatch(ApprovalStep::isApproved);
    }

    /**
     * 결재 생성을 위한 정적 팩토리 메서드
     */
    public static Approval createApproval(String taskTypeCd, Long taskId, 
                                         String requesterId, List<String> approvers, 
                                         String urgency) {
        Approval approval = Approval.builder()
                .taskTypeCd(taskTypeCd)
                .taskId(taskId)
                .requesterId(requesterId)
                .apprStatCd(Status.SUBMITTED)
                .urgencyCd(urgency != null ? urgency : Urgency.NORMAL)
                .build();

        // 결재 단계 생성
        for (int i = 0; i < approvers.size(); i++) {
            ApprovalStep step = ApprovalStep.createStep(
                null, // approval ID는 저장 후 설정
                i + 1,
                approvers.get(i),
                i == 0 // 첫 번째 단계만 PENDING
            );
            approval.addStep(step);
        }

        return approval;
    }
}