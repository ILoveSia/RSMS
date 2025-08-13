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
     * 메뉴얼 내용
     */
    @Column(name = "manual_content", columnDefinition = "TEXT")
    private String manualContent;

    // status 컴럼 삭제됨

    // approval_id 컴럼 삭제됨

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

    // reviewer_emp_no 컴럼 삭제됨

    // approver_emp_no 컴럼 삭제됨

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

    // ManualStatus enum 삭제됨

    /**
     * 버전 업데이트
     */
    public void updateVersion(String newVersion) {
        this.manualVersion = newVersion;
    }

    /**
     * 메뉴얼이 유효한지 확인
     */
    public boolean isValid() {
        LocalDate now = LocalDate.now();
        return (effectiveDate == null || !now.isBefore(effectiveDate)) &&
               (expiryDate == null || !now.isAfter(expiryDate));
    }
}