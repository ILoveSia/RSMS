package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 직책 생성 요청 DTO
 *
 * 직책 생성 시 필요한 정보를 전송하기 위한 DTO입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 직책 생성 요청 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 생성에 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionCreateRequestDto {

    /**
     * 원장차수
     */
    private Long ledgerOrder;

    /**
     * 직책명
     */
    @Size(max = 200, message = "직책명은 200자를 초과할 수 없습니다.")
    private String positionName;

    /**
     * 확정구분코드
     */
    @Size(max = 10, message = "확정구분코드는 10자를 초과할 수 없습니다.")
    private String confirmGubunCd;

    /**
     * 책무기술서 작성 부서코드
     */
    @Size(max = 10, message = "책무기술서 작성 부서코드는 10자를 초과할 수 없습니다.")
    private String writeDeptCd;

    /**
     * 소관부서코드 목록
     */
    private List<String> ownerDeptCds;

    /**
     * 회의체 ID 목록
     */
    private List<String> meetingBodyIds;

    /**
     * 관리자 ID 목록
     */
    private List<String> adminIds;
}
