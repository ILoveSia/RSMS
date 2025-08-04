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
 * 인수인계 지정 관리 엔티티
 * 직책별 인수인계 지정 및 진행 상황을 관리합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Entity
@Table(name = "handover_assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    /**
     * 직책 ID (positions 테이블 FK)
     */
    @Column(name = "position_id", nullable = false)
    private Long positionId;

    /**
     * 인수인계 유형 (POSITION, RESPONSIBILITY)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "handover_type", length = 20, nullable = false)
    private HandoverType handoverType;

    /**
     * 인계자 사번
     */
    @Column(name = "handover_from_emp_no", length = 20)
    private String handoverFromEmpNo;

    /**
     * 인계자 이름
     */
    @Column(name = "handover_from_name", length = 50)
    private String handoverFromName;

    /**
     * 인계자 부서
     */
    @Column(name = "handover_from_dept", length = 100)
    private String handoverFromDept;

    /**
     * 인수자 사번
     */
    @Column(name = "handover_to_emp_no", length = 20, nullable = false)
    private String handoverToEmpNo;

    /**
     * 인수자 이름
     */
    @Column(name = "handover_to_name", length = 50, nullable = false)
    private String handoverToName;

    /**
     * 인수자 부서
     */
    @Column(name = "handover_to_dept", length = 100)
    private String handoverToDept;

    /**
     * 인수인계 시작 예정일
     */
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    /**
     * 인수인계 완료 예정일
     */
    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    /**
     * 실제 시작일시
     */
    @Column(name = "actual_start_date")
    private LocalDateTime actualStartDate;

    /**
     * 실제 완료일시
     */
    @Column(name = "actual_end_date")
    private LocalDateTime actualEndDate;

    /**
     * 상태 (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private HandoverStatus status = HandoverStatus.PLANNED;

    /**
     * 진행률 (0-100)
     */
    @Column(name = "progress_rate")
    @Builder.Default
    private Integer progressRate = 0;

    /**
     * 특이사항
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

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
     * 인수인계 유형 열거형
     */
    public enum HandoverType {
        POSITION,       // 직책 인수인계
        RESPONSIBILITY  // 책무 인수인계
    }

    /**
     * 인수인계 상태 열거형
     */
    public enum HandoverStatus {
        PLANNED,        // 계획
        IN_PROGRESS,    // 진행중
        COMPLETED,      // 완료
        CANCELLED       // 취소
    }

    /**
     * 인수인계 시작
     */
    public void startHandover() {
        this.status = HandoverStatus.IN_PROGRESS;
        this.actualStartDate = LocalDateTime.now();
        if (this.progressRate == null || this.progressRate == 0) {
            this.progressRate = 10;
        }
    }

    /**
     * 인수인계 완료
     */
    public void completeHandover() {
        this.status = HandoverStatus.COMPLETED;
        this.actualEndDate = LocalDateTime.now();
        this.progressRate = 100;
    }

    /**
     * 인수인계 취소
     */
    public void cancelHandover() {
        this.status = HandoverStatus.CANCELLED;
    }

    /**
     * 진행률 업데이트
     */
    public void updateProgress(Integer progressRate) {
        if (progressRate != null && progressRate >= 0 && progressRate <= 100) {
            this.progressRate = progressRate;
            if (progressRate == 100 && this.status == HandoverStatus.IN_PROGRESS) {
                completeHandover();
            }
        }
    }
}