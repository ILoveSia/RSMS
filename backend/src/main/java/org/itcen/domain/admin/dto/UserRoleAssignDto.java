package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * 사용자 역할 할당 DTO
 * 사용자에게 역할을 할당할 때 사용합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleAssignDto {
    
    /**
     * 역할 ID
     */
    @NotBlank(message = "역할 ID는 필수입니다")
    private String roleId;
    
    /**
     * 할당자 (선택사항, 기본값: 현재 사용자)
     */
    private String assignedBy;
}