package org.itcen.domain.handover.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 인수인계 지정 엔티티
 */
@Entity
@Table(name = "handover_assignments")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HandoverAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "position_id", nullable = false)
    private Long positionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "handover_type", nullable = false, length = 20)
    private HandoverType handoverType;

    // 인계자 정보
    @Column(name = "handover_from_emp_no", length = 20)
    private String handoverFromEmpNo;

    @Column(name = "handover_from_name", length = 50)
    private String handoverFromName;



    // 인수자 정보
    @Column(name = "handover_to_emp_no", nullable = false, length = 20)
    private String handoverToEmpNo;

    @Column(name = "handover_to_name", nullable = false, length = 50)
    private String handoverToName;



    // 일정 정보
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "actual_start_date")
    private LocalDateTime actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDateTime actualEndDate;

    // 상태 관리
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private HandoverStatus status = HandoverStatus.PLANNED;

    @Column(name = "progress_rate")
    @Builder.Default
    private Integer progressRate = 0;

    // 비고
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * 인수인계 유형 enum
     */
    public enum HandoverType {
        POSITION("직책"),
        RESPONSIBILITY("책무");

        private final String description;

        HandoverType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 인수인계 상태 enum
     */
    public enum HandoverStatus {
        PLANNED("계획"),
        IN_PROGRESS("진행중"),
        COMPLETED("완료"),
        CANCELLED("취소");

        private final String description;

        HandoverStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 인수인계 시작
     */
    public void startHandover() {
        this.status = HandoverStatus.IN_PROGRESS;
        this.actualStartDate = LocalDateTime.now();
        if (this.progressRate == null || this.progressRate == 0) {
            this.progressRate = 10; // 시작 시 10%로 설정
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
        if (progressRate < 0 || progressRate > 100) {
            throw new IllegalArgumentException("진행률은 0-100 사이의 값이어야 합니다.");
        }
        this.progressRate = progressRate;
        
        // 100% 달성 시 자동 완료
        if (progressRate == 100) {
            completeHandover();
        }
    }
}