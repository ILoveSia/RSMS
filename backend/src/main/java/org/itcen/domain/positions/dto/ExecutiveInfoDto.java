package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 임원 정보 DTO
 * 직책 ID로 조회한 임원 정보를 반환하기 위한 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveInfoDto {
    
    private String execofficerId;  // 임원 ID
    private String empName;        // 직원 이름
    private String empNo;          // 직원 번호
}