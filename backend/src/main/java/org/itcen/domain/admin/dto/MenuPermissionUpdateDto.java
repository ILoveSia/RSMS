package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 메뉴 권한 업데이트 DTO
 * 메뉴 권한 수정 요청 정보를 담습니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuPermissionUpdateDto {
    
    /**
     * 역할명
     */
    @NotBlank(message = "역할명은 필수입니다")
    private String roleName;
    
    /**
     * 읽기 권한
     */
    @NotNull(message = "읽기 권한 설정은 필수입니다")
    private Boolean canRead;
    
    /**
     * 쓰기 권한
     */
    @NotNull(message = "쓰기 권한 설정은 필수입니다")
    private Boolean canWrite;
    
    /**
     * 삭제 권한
     */
    @NotNull(message = "삭제 권한 설정은 필수입니다")
    private Boolean canDelete;
    
    /**
     * 권한 검증
     */
    public boolean isValid() {
        // 삭제 권한이 있으면 읽기, 쓰기 권한도 있어야 함
        if (Boolean.TRUE.equals(canDelete) && (!Boolean.TRUE.equals(canRead) || !Boolean.TRUE.equals(canWrite))) {
            return false;
        }
        // 쓰기 권한이 있으면 읽기 권한도 있어야 함
        if (Boolean.TRUE.equals(canWrite) && !Boolean.TRUE.equals(canRead)) {
            return false;
        }
        return true;
    }
    
    /**
     * 권한 레벨 반환
     */
    public String getPermissionLevel() {
        if (Boolean.TRUE.equals(canDelete)) return "FULL";
        if (Boolean.TRUE.equals(canWrite)) return "WRITE";
        if (Boolean.TRUE.equals(canRead)) return "READ";
        return "NONE";
    }
}