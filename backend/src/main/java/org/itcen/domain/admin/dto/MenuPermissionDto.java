package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 권한 DTO
 * 메뉴와 역할별 권한 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuPermissionDto {
    
    private Long id;
    private Long menuId;
    private String menuName;
    private String menuPath;
    private String roleName;
    private Boolean canRead;
    private Boolean canWrite;
    private Boolean canDelete;
    
    /**
     * 권한 상태 체크
     */
    public boolean hasAnyPermission() {
        return Boolean.TRUE.equals(canRead) || 
               Boolean.TRUE.equals(canWrite) || 
               Boolean.TRUE.equals(canDelete);
    }
    
    /**
     * 읽기 전용 권한인지 확인
     */
    public boolean isReadOnly() {
        return Boolean.TRUE.equals(canRead) && 
               !Boolean.TRUE.equals(canWrite) && 
               !Boolean.TRUE.equals(canDelete);
    }
    
    /**
     * 전체 권한인지 확인
     */
    public boolean hasFullPermission() {
        return Boolean.TRUE.equals(canRead) && 
               Boolean.TRUE.equals(canWrite) && 
               Boolean.TRUE.equals(canDelete);
    }
}