package org.itcen.domain.departments.entity;

import jakarta.persistence.*;
import lombok.*;
import org.itcen.common.entity.BaseTimeEntity;

/**
 * 부서 정보 엔티티
 * departments 테이블과 매핑
 */
@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department extends BaseTimeEntity {

    /**
     * 부서 ID (기본 키)
     */
    @Id
    @Column(name = "department_id", length = 20)
    private String departmentId;

    /**
     * 부서명
     */
    @Column(name = "department_name", length = 100, nullable = false, unique = true)
    private String departmentName;

    /**
     * 사용 여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "use_yn", length = 1, nullable = false)
    @Builder.Default
    private String useYn = "Y";

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
     * 활성 상태 확인
     */
    public boolean isActive() {
        return "Y".equals(useYn);
    }

    /**
     * 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }

    /**
     * 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }
}
