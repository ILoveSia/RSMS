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
 * 사업계획 점검 관리 엔티티
 * 부서별 사업계획 점검 현황 및 결과를 관리합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Entity
@Table(name = "business_plan_inspections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessPlanInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspection_id")
    private Long inspectionId;

    /**
     * 부서코드
     */
    @Column(name = "dept_cd", length = 10, nullable = false)
    private String deptCd;

    /**
     * 점검 연도
     */
    @Column(name = "inspection_year", nullable = false)
    private Integer inspectionYear;

    /**
     * 점검 분기 (1,2,3,4)
     */
    @Column(name = "inspection_quarter")
    private Integer inspectionQuarter;

    /**
     * 점검 제목
     */
    @Column(name = "inspection_title", length = 200, nullable = false)
    private String inspectionTitle;

    /**
     * 점검 유형 (QUARTERLY, SEMI_ANNUAL, ANNUAL, SPECIAL)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", length = 50, nullable = false)
    private InspectionType inspectionType;

    /**
     * 점검 시작 예정일
     */
    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    /**
     * 점검 완료 예정일
     */
    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    /**
     * 점검 범위
     */
    @Column(name = "inspection_scope", columnDefinition = "TEXT")
    private String inspectionScope;

    /**
     * 점검 기준
     */
    @Column(name = "inspection_criteria", columnDefinition = "TEXT")
    private String inspectionCriteria;

    /**
     * 실제 점검 시작일
     */
    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    /**
     * 실제 점검 완료일
     */
    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    /**
     * 상태 (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private InspectionStatus status = InspectionStatus.PLANNED;

    /**
     * 점검자 사번
     */
    @Column(name = "inspector_emp_no", length = 20)
    private String inspectorEmpNo;

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
     * 종합 등급
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "overall_grade", length = 20)
    private InspectionGrade overallGrade;

    /**
     * 개선 조치 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "improvement_status", length = 20)
    private ImprovementStatus improvementStatus;

    /**
     * 개선 조치 기한
     */
    @Column(name = "improvement_due_date")
    private LocalDate improvementDueDate;

    /**
     * 점검 유형 열거형
     */
    public enum InspectionType {
        QUARTERLY,      // 분기별
        SEMI_ANNUAL,    // 반기별
        ANNUAL,         // 연간
        SPECIAL         // 특별점검
    }

    /**
     * 점검 상태 열거형
     */
    public enum InspectionStatus {
        PLANNED,        // 계획
        IN_PROGRESS,    // 진행중
        COMPLETED,      // 완료
        CANCELLED       // 취소
    }

    /**
     * 점검 등급 (우수, 양호, 보통, 미흡)
     */
    public enum InspectionGrade {
        EXCELLENT,      // 우수
        GOOD,           // 양호
        FAIR,           // 보통
        POOR            // 미흡
    }

    /**
     * 개선 상태 (해당없음, 조치필요, 진행중, 완료)
     */
    public enum ImprovementStatus {
        NOT_APPLICABLE, // 해당없음
        ACTION_REQUIRED,// 조치필요
        IN_PROGRESS,    // 진행중
        COMPLETED       // 완료
    }

    /**
     * 점검 시작
     */
    public void startInspection(String inspectorEmpNo) {
        this.status = InspectionStatus.IN_PROGRESS;
        this.actualStartDate = LocalDate.now();
        this.inspectorEmpNo = inspectorEmpNo;
    }

    /**
     * 점검 완료
     */
    public void completeInspection() {
        this.status = InspectionStatus.COMPLETED;
        this.actualEndDate = LocalDate.now();
    }

    /**
     * 점검 취소
     */
    public void cancelInspection() {
        this.status = InspectionStatus.CANCELLED;
    }

    /**
     * 점검이 예정대로 진행되고 있는지 확인
     */
    public boolean isOnSchedule() {
        LocalDate now = LocalDate.now();
        if (status == InspectionStatus.PLANNED) {
            return plannedStartDate == null || !now.isAfter(plannedStartDate);
        } else if (status == InspectionStatus.IN_PROGRESS) {
            return plannedEndDate == null || !now.isAfter(plannedEndDate);
        }
        return true;
    }
}