package org.itcen.domain.approval.entity;

import java.time.LocalDateTime;
import org.itcen.common.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 결재 단계 엔티티
 * 
 * SOLID 원칙:
 * - 단일 책임: 결재 단계별 상세 정보만 관리
 * - 개방-폐쇄: 새로운 결재 상태 추가 시 확장 가능
 * - 리스코프 치환: BaseTimeEntity의 모든 동작 지원
 * - 인터페이스 분리: 필요한 기능만 노출
 * - 의존성 역전: 구현체가 아닌 추상화에 의존
 */
@Entity(name = "ApprovalStep")
@Table(name = "approval_steps", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"approval_id", "step_order"}))
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStep extends BaseTimeEntity {

    /**
     * 단계 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "step_id")
    private Long stepId;

    /**
     * 결재 ID (Foreign Key)
     */
    @Column(name = "approval_id", nullable = false)
    private Long approvalId;

    /**
     * 결재 마스터 (연관 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", insertable = false, updatable = false)
    private Approval approval;

    /**
     * 결재 순서 (1, 2, 3)
     */
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    /**
     * 결재자 ID
     */
    @Column(name = "approver_id", nullable = false, length = 100)
    private String approverId;

    /**
     * 단계 상태
     */
    @Builder.Default
    @Column(name = "step_status", nullable = false, length = 20)
    private String stepStatus = "PENDING";

    /**
     * 승인 일시
     */
    @Column(name = "approved_datetime")
    private LocalDateTime approvedDatetime;

    /**
     * 결재 의견
     */
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    /**
     * 결재 단계 상태 열거형
     */
    public static class Status {
        public static final String PENDING = "PENDING";     // 결재 대기
        public static final String APPROVED = "APPROVED";   // 승인
        public static final String REJECTED = "REJECTED";   // 반려
        public static final String WAITING = "WAITING";     // 순서 대기
        public static final String SKIPPED = "SKIPPED";     // 건너뜀
    }

    /**
     * 결재 승인 처리
     */
    public void approve(String comments) {
        this.stepStatus = Status.APPROVED;
        this.approvedDatetime = LocalDateTime.now();
        this.comments = comments;
    }

    /**
     * 결재 반려 처리
     */
    public void reject(String reason) {
        this.stepStatus = Status.REJECTED;
        this.approvedDatetime = LocalDateTime.now();
        this.comments = reason;
    }

    /**
     * 결재 단계 활성화 (대기 → 진행)
     */
    public void activate() {
        if (Status.WAITING.equals(this.stepStatus)) {
            this.stepStatus = Status.PENDING;
        }
    }

    /**
     * 결재 단계 건너뛰기
     */
    public void skip(String reason) {
        this.stepStatus = Status.SKIPPED;
        this.approvedDatetime = LocalDateTime.now();
        this.comments = reason;
    }

    /**
     * 현재 결재 대기 상태인지 확인
     */
    public boolean isPending() {
        return Status.PENDING.equals(this.stepStatus);
    }

    /**
     * 승인 완료 상태인지 확인
     */
    public boolean isApproved() {
        return Status.APPROVED.equals(this.stepStatus);
    }

    /**
     * 반려 상태인지 확인
     */
    public boolean isRejected() {
        return Status.REJECTED.equals(this.stepStatus);
    }

    /**
     * 대기 상태인지 확인
     */
    public boolean isWaiting() {
        return Status.WAITING.equals(this.stepStatus);
    }

    /**
     * 처리 완료 상태인지 확인 (승인 또는 반려)
     */
    public boolean isProcessed() {
        return isApproved() || isRejected();
    }

    /**
     * 결재 단계 생성을 위한 정적 팩토리 메서드
     */
    public static ApprovalStep createStep(Long approvalId, Integer stepOrder, 
                                         String approverId, boolean isFirst) {
        return ApprovalStep.builder()
                .approvalId(approvalId)
                .stepOrder(stepOrder)
                .approverId(approverId)
                .stepStatus(isFirst ? Status.PENDING : Status.WAITING)
                .build();
    }
}