package org.itcen.auth.domain.permission;

import java.util.ArrayList;
import java.util.List;
import org.itcen.common.entity.BaseTimeEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * 역할(Role) 엔티티 - 새로운 권한 관리 시스템
 *
 * SOLID 원칙: - 단일 책임: 역할 정보 관리만 담당 - 개방-폐쇄: 새로운 역할 타입 추가 시 확장 가능 - 리스코프 치환: BaseTimeEntity의 모든 동작 지원
 * - 인터페이스 분리: 필요한 기능만 노출 - 의존성 역전: 구현체가 아닌 추상화에 의존
 */
@Entity(name = "PermissionRole")
@Table(name = "roles")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseTimeEntity {

    /**
     * 역할 ID (Primary Key)
     */
    @Id
    @Column(name = "role_id", length = 20)
    private String roleId;

    /**
     * 역할명
     */
    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    /**
     * 역할 설명
     */
    @Column(length = 500)
    private String description;

    /**
     * 사용 여부
     */
    @Builder.Default
    @Column(name = "use_yn", nullable = false, length = 1)
    private String useYn = "Y";

    /**
     * 역할-권한 매핑 (양방향 관계)
     */
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<RolePermission> rolePermissions = new ArrayList<>();

    /**
     * 사용자-역할 매핑 (양방향 관계)
     */
    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<UserRole> userRoles = new ArrayList<>();

    /**
     * 역할 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }

    /**
     * 역할 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }

    /**
     * 활성 상태 확인
     */
    public boolean isActive() {
        return "Y".equals(this.useYn);
    }

    /**
     * 기본 역할 생성을 위한 정적 팩토리 메서드
     */
    public static Role createRole(String roleId, String roleName, String description) {
        return Role.builder().roleId(roleId).roleName(roleName).description(description).useYn("Y")
                .build();
    }
}
