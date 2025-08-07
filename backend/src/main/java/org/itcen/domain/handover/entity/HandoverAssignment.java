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


    @Enumerated(EnumType.STRING)
    @Column(name = "handover_type", nullable = false, length = 20)
    private HandoverType handoverType;

    // 인계자 정보
    @Column(name = "handover_from_emp_no", length = 20)
    private String handoverFromEmpNo;



    // 인수자 정보
    @Column(name = "handover_to_emp_no", nullable = false, length = 20)
    private String handoverToEmpNo;




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
     * 인수인계 취소
     */
    public void cancelHandover() {
        this.status = HandoverStatus.CANCELLED;
    }

}