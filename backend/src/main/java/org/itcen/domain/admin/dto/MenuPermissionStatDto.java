package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴별 권한 통계 DTO
 * 각 메뉴별 권한 현황을 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuPermissionStatDto {
    
    private Long menuId;
    private String menuName;
    private String menuPath;
    private Integer menuOrder;
    private int readCount;
    private int writeCount;
    private int deleteCount;
    private int totalRoles;
    
    /**
     * 권한 비율 계산
     */
    public double getReadRate() {
        return totalRoles > 0 ? (double) readCount / totalRoles * 100 : 0;
    }
    
    public double getWriteRate() {
        return totalRoles > 0 ? (double) writeCount / totalRoles * 100 : 0;
    }
    
    public double getDeleteRate() {
        return totalRoles > 0 ? (double) deleteCount / totalRoles * 100 : 0;
    }
    
    /**
     * 접근 제한 수준 반환
     */
    public String getAccessLevel() {
        double readRate = getReadRate();
        if (readRate >= 80) return "PUBLIC";
        if (readRate >= 50) return "NORMAL";
        if (readRate > 0) return "RESTRICTED";
        return "NONE";
    }
}