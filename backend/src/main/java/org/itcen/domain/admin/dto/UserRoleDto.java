package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자 역할 DTO
 * 사용자-역할 매핑 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleDto {
    
    private String userId;
    private String roleId;
    private String roleName;
    private String roleDescription;
    private LocalDateTime assignedAt;
    private String assignedBy;
    private Boolean isActive;
    
    /**
     * 활성 상태 확인
     */
    public boolean isActiveRole() {
        return Boolean.TRUE.equals(isActive);
    }
    
    /**
     * 시스템 할당 여부 확인
     */
    public boolean isSystemAssigned() {
        return "system".equals(assignedBy);
    }
}