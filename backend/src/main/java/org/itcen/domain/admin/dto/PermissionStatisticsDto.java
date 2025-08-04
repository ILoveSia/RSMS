package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 권한 통계 DTO
 * 전체 권한 시스템의 통계 정보를 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionStatisticsDto {
    
    /**
     * 사용자 통계
     */
    private UserStats userStats;
    
    /**
     * 역할 통계
     */
    private RoleStats roleStats;
    
    /**
     * 메뉴 통계
     */
    private MenuStats menuStats;
    
    /**
     * 권한 분포
     */
    private List<PermissionDistribution> permissionDistribution;
    
    /**
     * 사용자 통계
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private int totalUsers;
        private int activeUsers;
        private int usersWithRoles;
        private int usersWithMultipleRoles;
        private double averageRolesPerUser;
    }
    
    /**
     * 역할 통계
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleStats {
        private int totalRoles;
        private int activeRoles;
        private int rolesInUse;
        private String mostUsedRole;
        private String leastUsedRole;
    }
    
    /**
     * 메뉴 통계
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuStats {
        private int totalMenus;
        private int menusWithPermissions;
        private int publicMenus;
        private int restrictedMenus;
        private double averagePermissionsPerMenu;
    }
    
    /**
     * 권한 분포
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionDistribution {
        private String roleName;
        private int readPermissions;
        private int writePermissions;
        private int deletePermissions;
        private double permissionCoverage; // 전체 메뉴 대비 권한 비율
    }
}