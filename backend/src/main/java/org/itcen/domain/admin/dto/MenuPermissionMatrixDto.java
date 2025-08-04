package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 메뉴 권한 매트릭스 DTO
 * 전체 메뉴와 역할별 권한을 매트릭스 형태로 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuPermissionMatrixDto {
    
    /**
     * 메뉴 목록
     */
    private List<MenuInfo> menus;
    
    /**
     * 역할 목록
     */
    private List<String> roles;
    
    /**
     * 권한 매트릭스 (menuId -> roleName -> permissions)
     */
    private Map<Long, Map<String, PermissionSet>> permissionMatrix;
    
    /**
     * 메뉴 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuInfo {
        private Long menuId;
        private String menuName;
        private String menuPath;
        private Integer menuOrder;
        private Long parentId;
        private Integer level;
    }
    
    /**
     * 권한 세트
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionSet {
        private Boolean canRead;
        private Boolean canWrite;
        private Boolean canDelete;
        
        public PermissionSet(boolean canRead, boolean canWrite, boolean canDelete) {
            this.canRead = canRead;
            this.canWrite = canWrite;
            this.canDelete = canDelete;
        }
        
        /**
         * 권한이 있는지 확인
         */
        public boolean hasAnyPermission() {
            return Boolean.TRUE.equals(canRead) || 
                   Boolean.TRUE.equals(canWrite) || 
                   Boolean.TRUE.equals(canDelete);
        }
        
        /**
         * 권한 레벨 계산 (0: 없음, 1: 읽기, 2: 읽기+쓰기, 3: 전체)
         */
        public int getPermissionLevel() {
            if (Boolean.TRUE.equals(canDelete)) return 3;
            if (Boolean.TRUE.equals(canWrite)) return 2;
            if (Boolean.TRUE.equals(canRead)) return 1;
            return 0;
        }
    }
}