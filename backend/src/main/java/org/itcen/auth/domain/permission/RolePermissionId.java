package org.itcen.auth.domain.permission;

import java.io.Serializable;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 역할-권한 매핑 복합키 클래스
 *
 * JPA @IdClass 어노테이션을 위한 복합키 정의
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionId implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 역할 ID
     */
    private String roleId;

    /**
     * 권한 ID
     */
    private String permissionId;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RolePermissionId that = (RolePermissionId) o;
        return Objects.equals(roleId, that.roleId)
                && Objects.equals(permissionId, that.permissionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(roleId, permissionId);
    }
}
