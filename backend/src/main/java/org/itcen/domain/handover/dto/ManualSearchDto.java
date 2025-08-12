package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.InternalControlManual;

import java.time.LocalDate;

/**
 * 내부통제 메뉴얼 검색 DTO
 * 복합 조건 검색을 위한 파라미터를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 검색 조건 데이터만 담당
 * - Open/Closed: 새로운 검색 조건 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualSearchDto {
    
    /**
     * 부서코드
     */
    private String deptCd;
    
    /**
     * 메뉴얼 상태 (status 컬럼 삭제됨)
     */
    private String status;
    
    /**
     * 메뉴얼 분류
     */
    private String manualCategory;
    
    /**
     * 작성자 사번
     */
    private String authorEmpNo;
    
    /**
     * 메뉴얼 제목 (부분 검색)
     */
    private String manualTitle;
    
    /**
     * 메뉴얼 버전
     */
    private String manualVersion;
    
    /**
     * 시행일 시작
     */
    private LocalDate effectiveDate;
    
    /**
     * 만료일
     */
    private LocalDate expiryDate;
    
    /**
     * 검색 시작일
     */
    private LocalDate startDate;
    
    /**
     * 검색 종료일
     */
    private LocalDate endDate;
}
