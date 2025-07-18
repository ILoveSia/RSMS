package org.itcen.auth.domain.permission;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 역할-권한 매핑 엔티티
 *
 * SOLID 원칙: - 단일 책임: 역할과 권한의 매핑 관계만 담당 - 개방-폐쇄: 새로운 매핑 조건 추가 시 확장 가능 - 리스코프 치환: 기본적인 매핑 동작 지원 -
 * 인터페이스 분리: 필요한 기능만 노출 - 의존성 역전: 구현체가 아닌 추상화에 의존
 */
@Entity(name = "RolePermission")
@Table(name = "role_permissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RolePermissionId.class)
public class RolePermission {

    /**
     * 역할 ID (복합키)
     */
    @Id
    @Column(name = "role_id", length = 20)
    private String roleId;

    /**
     * 권한 ID (복합키)
     */
    @Id
    @Column(name = "permission_id", length = 20)
    private String permissionId;

    /**
     * 권한 부여 일시
     */
    @Builder.Default
    @Column(name = "granted_at", nullable = false)
    private LocalDateTime grantedAt = LocalDateTime.now();

    /**
     * 권한 부여자
     */
    @Builder.Default
    @Column(name = "granted_by", length = 50)
    private String grantedBy = "system";

    /**
     * 역할 엔티티 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    /**
     * API 권한 엔티티 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", insertable = false, updatable = false)
    private ApiPermission apiPermission;

    /**
     * 역할-권한 매핑 생성을 위한 정적 팩토리 메서드
     */
    public static RolePermission createMapping(String roleId, String permissionId,
            String grantedBy) {
        return RolePermission.builder().roleId(roleId).permissionId(permissionId)
                .grantedAt(LocalDateTime.now()).grantedBy(grantedBy).build();
    }

    /**
     * 역할-권한 매핑 생성 (시스템에 의한)
     */
    public static RolePermission createMapping(String roleId, String permissionId) {
        return createMapping(roleId, permissionId, "system");
    }
}
