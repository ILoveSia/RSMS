package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자와 역할 정보 DTO
 * 사용자 기본 정보와 할당된 역할 목록을 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWithRolesDto {
    
    /**
     * 사용자 기본 정보
     */
    private String userId;
    private String userName;
    private String email;
    private String empNo;
    private String department;        // 부서코드
    private String departmentName;    // 부서명
    private String position;          // 직급코드
    private String positionName;      // 직급명
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    
    /**
     * 할당된 역할 목록
     */
    private List<UserRoleInfo> roles;
    
    /**
     * 권한 통계
     */
    private PermissionSummary permissionSummary;
    
    /**
     * 사용자 역할 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRoleInfo {
        private String roleId;
        private String roleName;
        private String roleDescription;
        private LocalDateTime assignedAt;
        private String assignedBy;
        private Boolean isActive;
    }
    
    /**
     * 권한 요약
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionSummary {
        private int totalMenus;
        private int accessibleMenus;
        private int readableMenus;
        private int writableMenus;
        private int deletableMenus;
        private String highestRole;
        
        /**
         * 접근률 계산
         */
        public double getAccessRate() {
            return totalMenus > 0 ? (double) accessibleMenus / totalMenus * 100 : 0;
        }
    }
    
    /**
     * 관리자 권한 확인
     */
    public boolean isAdmin() {
        return roles != null && roles.stream()
                .anyMatch(role -> "ADMIN".equals(role.getRoleId()) && Boolean.TRUE.equals(role.getIsActive()));
    }
    
    /**
     * 특정 역할 보유 확인
     */
    public boolean hasRole(String roleId) {
        return roles != null && roles.stream()
                .anyMatch(role -> roleId.equals(role.getRoleId()) && Boolean.TRUE.equals(role.getIsActive()));
    }
    
    /**
     * 활성 역할 개수
     */
    public int getActiveRoleCount() {
        return roles != null ? (int) roles.stream()
                .filter(role -> Boolean.TRUE.equals(role.getIsActive()))
                .count() : 0;
    }
}