package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 역할 DTO
 * 시스템의 역할 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    
    private String roleId;
    private String roleName;
    private String roleDescription;
    private Integer roleLevel;
    private Boolean isActive;
    private int userCount; // 해당 역할을 가진 사용자 수
    private int permissionCount; // 해당 역할이 가진 권한 수
    
    /**
     * 시스템 역할 여부 확인
     */
    public boolean isSystemRole() {
        return "ADMIN".equals(roleId) || "SYSTEM".equals(roleId);
    }
    
    /**
     * 관리자 역할 여부 확인
     */
    public boolean isAdminRole() {
        return "ADMIN".equals(roleId);
    }
}