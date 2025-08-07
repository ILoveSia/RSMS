package org.itcen.domain.handover.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 부서장 내부통제 업무메뉴얼 관리 엔티티
 * 부서별 내부통제 업무메뉴얼 작성 및 관리를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 메뉴얼 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Entity
@Table(name = "internal_control_manuals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternalControlManual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manual_id")
    private Long manualId;

    /**
     * 부서코드
     */
    @Column(name = "dept_cd", length = 10, nullable = false)
    private String deptCd;

    /**
     * 부서장 내부통제 항목 ID (hod_ic_item 테이블 FK, 선택)
     */
    @Column(name = "hod_ic_item_id")
    private Long hodIcItemId;

    /**
     * 메뉴얼 제목
     */
    @Column(name = "manual_title", length = 200, nullable = false)
    private String manualTitle;

    /**
     * 메뉴얼 버전
     */
    @Column(name = "manual_version", length = 20)
    @Builder.Default
    private String manualVersion = "1.0";

    /**
     * 메뉴얼 설명
     */
    @Column(name = "manual_description", columnDefinition = "TEXT")
    private String manualDescription;

    /**
     * 메뉴얼 내용
     */
    @Column(name = "manual_content", columnDefinition = "TEXT")
    private String manualContent;

    /**
     * 메뉴얼 분류
     */
    @Column(name = "manual_category", length = 50)
    private String manualCategory;

    /**
     * 내부통제 업무 분류
     */
    @Column(name = "ic_task_category", length = 100)
    private String icTaskCategory;

    /**
     * 상태 (DRAFT, REVIEW, APPROVED, PUBLISHED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private ManualStatus status = ManualStatus.DRAFT;

    /**
     * 승인 ID
     */
    @Column(name = "approval_id")
    private Long approvalId;

    /**
     * 시행일
     */
    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    /**
     * 만료일
     */
    @Column(name = "expiry_date")
    @Builder.Default
    private LocalDate expiryDate = LocalDate.of(9999, 12, 31);

    /**
     * 검토 주기 (월)
     */
    @Column(name = "review_cycle_months")
    @Builder.Default
    private Integer reviewCycleMonths = 12;

    /**
     * 차기 검토일
     */
    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    /**
     * 작성자 사번
     */
    @Column(name = "author_emp_no", length = 20)
    private String authorEmpNo;

    /**
     * 부서장 사번
     */
    @Column(name = "hod_emp_no", length = 20)
    private String hodEmpNo;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 생성자 ID
     */
    @Column(name = "created_id", length = 100)
    private String createdId;

    /**
     * 수정자 ID
     */
    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 메뉴얼 상태 열거형
     */
    public enum ManualStatus {
        DRAFT,      // 초안
        REVIEW,     // 검토중
        APPROVED,   // 승인완료
        PUBLISHED   // 발행완료
    }

    /**
     * 검토 단계로 진행
     */
    public void submitForReview() {
        this.status = ManualStatus.REVIEW;
    }

    /**
     * 부서장 승인 처리
     */
    public void approveByHod() {
        this.status = ManualStatus.APPROVED;
    }

    /**
     * 발행 처리
     */
    public void publish() {
        if (this.status == ManualStatus.APPROVED) {
            this.status = ManualStatus.PUBLISHED;
            if (this.effectiveDate == null) {
                this.effectiveDate = LocalDate.now();
            }
            // 차기 검토일 설정
            if (this.reviewCycleMonths != null && this.reviewCycleMonths > 0) {
                this.nextReviewDate = this.effectiveDate.plusMonths(this.reviewCycleMonths);
            }
        }
    }

    /**
     * 초안으로 되돌리기
     */
    public void revertToDraft() {
        this.status = ManualStatus.DRAFT;
        this.hodEmpNo = null;
    }

    /**
     * 버전 업데이트
     */
    public void updateVersion(String newVersion) {
        this.manualVersion = newVersion;
        // 버전 업데이트시 초안 상태로 변경
        revertToDraft();
    }

    /**
     * 검토 주기 업데이트 및 차기 검토일 재계산
     */
    public void updateReviewCycle(Integer months) {
        if (months != null && months > 0 && months <= 60) {
            this.reviewCycleMonths = months;
            if (this.effectiveDate != null) {
                this.nextReviewDate = this.effectiveDate.plusMonths(months);
            }
        }
    }

    /**
     * 메뉴얼이 유효한지 확인
     */
    public boolean isValid() {
        LocalDate now = LocalDate.now();
        return (effectiveDate == null || !now.isBefore(effectiveDate)) &&
               (expiryDate == null || !now.isAfter(expiryDate));
    }

    /**
     * 검토가 필요한지 확인
     */
    public boolean needsReview() {
        return nextReviewDate != null && !LocalDate.now().isBefore(nextReviewDate);
    }

    /**
     * 차기 검토일 계산 (ServiceImpl에서 사용)
     */
    public void calculateNextReviewDate() {
        if (this.effectiveDate != null && this.reviewCycleMonths != null && this.reviewCycleMonths > 0) {
            this.nextReviewDate = this.effectiveDate.plusMonths(this.reviewCycleMonths);
        }
    }
}