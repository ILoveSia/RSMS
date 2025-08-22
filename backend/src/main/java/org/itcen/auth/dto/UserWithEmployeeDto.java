package org.itcen.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 사용자와 직원 정보를 포함하는 DTO
 * 로그인 시 사용자 정보와 employee 정보를 함께 반환하기 위해 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWithEmployeeDto {
    
    /**
     * 사용자 ID
     */
    private String id;
    
    /**
     * 비밀번호
     */
    private String password;
    
    /**
     * 사번
     */
    private String empNo;
    
    /**
     * 사원명 (employee 테이블에서 조회)
     */
    private String empName;
    
    /**
     * 부서코드 (employee 테이블에서 조회)
     */
    private String deptCode;
    
    /**
     * 직급코드 (employee 테이블에서 조회)
     */
    private String positionCode;
    
    /**
     * 생성일시
     */
    private LocalDateTime createdAt;
    
    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;
}