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
 * 책무기술서 관리 엔티티
 * 직책별 책무기술서 작성 및 관리를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Entity
@Table(name = "responsibility_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponsibilityDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    /**
     * 직책 ID (positions 테이블 FK)
     */
    @Column(name = "position_id", nullable = false)
    private Long positionId;

    /**
     * 책무 ID (responsibility 테이블 FK, 선택)
     */
    @Column(name = "responsibility_id")
    private Long responsibilityId;

    /**
     * 문서 제목
     */
    @Column(name = "document_title", length = 200, nullable = false)
    private String documentTitle;

    /**
     * 문서 버전
     */
    @Column(name = "document_version", length = 20)
    @Builder.Default
    private String documentVersion = "1.0";

    /**
     * 문서 내용
     */
    @Column(name = "document_content", columnDefinition = "TEXT")
    private String documentContent;

    /**
     * 상태 (DRAFT, REVIEW, APPROVED, PUBLISHED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private DocumentStatus status = DocumentStatus.DRAFT;

    /**
     * 승인 ID (approval 테이블 FK)
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
     * 작성자 사번
     */
    @Column(name = "author_emp_no", length = 20)
    private String authorEmpNo;

    /**
     * 검토자 사번
     */
    @Column(name = "reviewer_emp_no", length = 20)
    private String reviewerEmpNo;

    /**
     * 승인자 사번
     */
    @Column(name = "approver_emp_no", length = 20)
    private String approverEmpNo;

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
     * 문서 상태 열거형
     */
    public enum DocumentStatus {
        DRAFT,      // 초안
        REVIEW,     // 검토중
        APPROVED,   // 승인완료
        PUBLISHED   // 발행완료
    }

    /**
     * 검토 단계로 진행
     */
    public void submitForReview(String reviewerEmpNo) {
        this.status = DocumentStatus.REVIEW;
        this.reviewerEmpNo = reviewerEmpNo;
    }

    /**
     * 승인 처리
     */
    public void approve(String approverEmpNo) {
        this.status = DocumentStatus.APPROVED;
        this.approverEmpNo = approverEmpNo;
    }

    /**
     * 발행 처리
     */
    public void publish() {
        if (this.status == DocumentStatus.APPROVED) {
            this.status = DocumentStatus.PUBLISHED;
            if (this.effectiveDate == null) {
                this.effectiveDate = LocalDate.now();
            }
        }
    }

    /**
     * 초안으로 되돌리기
     */
    public void revertToDraft() {
        this.status = DocumentStatus.DRAFT;
        this.reviewerEmpNo = null;
        this.approverEmpNo = null;
    }

    /**
     * 버전 업데이트
     */
    public void updateVersion(String newVersion) {
        this.documentVersion = newVersion;
        // 버전 업데이트시 초안 상태로 변경
        revertToDraft();
    }

    /**
     * 문서가 유효한지 확인
     */
    public boolean isValid() {
        LocalDate now = LocalDate.now();
        return (effectiveDate == null || !now.isBefore(effectiveDate)) &&
               (expiryDate == null || !now.isAfter(expiryDate));
    }
}