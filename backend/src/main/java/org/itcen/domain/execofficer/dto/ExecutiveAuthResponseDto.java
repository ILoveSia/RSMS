package org.itcen.domain.execofficer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 임원 권한 확인 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveAuthResponseDto {

    /**
     * 임원 여부
     */
    private Boolean isExecutive;

    /**
     * 임원 ID
     */
    private Long execofficerId;

    /**
     * 직원 ID (사번)
     */
    private String empId;

    /**
     * 직책 ID
     */
    private Long positionsId;

    /**
     * 직책명
     */
    private String positionsName;

    /**
     * 원장차수
     */
    private Long ledgerOrder;

    /**
     * 소관부서 수
     */
    private Integer departmentCount;
}