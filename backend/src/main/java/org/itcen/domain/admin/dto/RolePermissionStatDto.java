package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 역할별 권한 통계 DTO
 * 각 역할별 권한 현황을 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionStatDto {
    
    private String roleName;
    private String roleDescription;
    private int userCount;
    private int readCount;
    private int writeCount;
    private int deleteCount;
    private int totalMenus;
    
    /**
     * 권한 비율 계산
     */
    public double getReadRate() {
        return totalMenus > 0 ? (double) readCount / totalMenus * 100 : 0;
    }
    
    public double getWriteRate() {
        return totalMenus > 0 ? (double) writeCount / totalMenus * 100 : 0;
    }
    
    public double getDeleteRate() {
        return totalMenus > 0 ? (double) deleteCount / totalMenus * 100 : 0;
    }
    
    /**
     * 전체 권한 비율
     */
    public double getOverallPermissionRate() {
        return totalMenus > 0 ? (double) (readCount + writeCount + deleteCount) / (totalMenus * 3) * 100 : 0;
    }
    
    /**
     * 권한 레벨 분류
     */
    public String getPermissionLevel() {
        double overallRate = getOverallPermissionRate();
        if (overallRate >= 80) return "HIGH";
        if (overallRate >= 50) return "MEDIUM";
        if (overallRate > 0) return "LOW";
        return "NONE";
    }
    
    /**
     * 관리자 역할 여부
     */
    public boolean isAdminRole() {
        return "ADMIN".equals(roleName);
    }
}