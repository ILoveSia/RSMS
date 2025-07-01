package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 직책 수정 요청 DTO
 * 
 * 직책 수정 시 필요한 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 수정 요청 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 수정에 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionUpdateRequestDto {

    /**
     * 직책명
     */
    @Size(max = 200, message = "직책명은 200자를 초과할 수 없습니다.")
    private String positionName;

    /**
     * 책무기술서 작성 부서코드
     */
    @Size(max = 10, message = "책무기술서 작성 부서코드는 10자를 초과할 수 없습니다.")
    private String writeDeptCd;

    private List<String> ownerDeptCds;

    private List<String> meetingBodyIds;
    
    private List<String> adminIds;
} 