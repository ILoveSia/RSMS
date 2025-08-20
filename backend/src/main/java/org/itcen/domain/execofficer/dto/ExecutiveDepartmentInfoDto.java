package org.itcen.domain.execofficer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 임원 소관부서 정보 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveDepartmentInfoDto {

    /**
     * 부서코드
     */
    private String deptCd;

    /**
     * 부서명
     */
    private String deptName;

    /**
     * 책임부서코드
     */
    private String ownerDeptCd;

    /**
     * 직책 ID
     */
    private Long positionsId;

    /**
     * 직책명
     */
    private String positionsName;
}