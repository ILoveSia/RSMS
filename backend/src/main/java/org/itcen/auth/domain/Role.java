package org.itcen.auth.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseEntity;

/**
 * 사용자 권한 엔티티
 *
 * 단일 책임 원칙: 사용자 권한 정보만을 담당
 * 개방-폐쇄 원칙: 새로운 권한 타입 추가 시 확장 가능
 */
@Entity
@Table(name = "roles")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity {

    /**
     * 권한 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 권한 ID (역할 식별자)
     */
    @Column(name = "role_id", unique = true, nullable = false, length = 20)
    private String roleId;

    /**
     * 권한명 (ROLE_USER, ROLE_ADMIN 등)
     * ROLE_ 접두사를 포함하여 저장
     */
    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    /**
     * 권한 설명
     */
    @Column(length = 500)
    private String description;

    /**
     * 사용 여부 (Y: 사용, N: 미사용)
     */
    @Builder.Default
    @Column(name = "use_yn", nullable = false, length = 1)
    private String useYn = "Y";

    /**
     * 기본 권한 생성을 위한 정적 팩토리 메서드
     *
     * @param roleName 권한명 (ROLE_ 접두사 없이)
     * @return Role 엔티티
     */
    public static Role createUserRole(String roleName) {
        return Role.builder()
                .roleName("ROLE_" + roleName.toUpperCase())
                .description(roleName + " 권한")
                .useYn("Y")
                .build();
    }

    /**
     * 권한명에서 ROLE_ 접두사를 제거한 순수 권한명 반환
     *
     * @return 순수 권한명
     */
    public String getAuthority() {
        return this.roleName != null && this.roleName.startsWith("ROLE_") ?
               this.roleName.substring(5) : this.roleName;
    }

    /**
     * 권한 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }

    /**
     * 권한 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }

    /**
     * 활성 상태 확인
     */
    public boolean isEnabled() {
        return "Y".equals(this.useYn);
    }
}
