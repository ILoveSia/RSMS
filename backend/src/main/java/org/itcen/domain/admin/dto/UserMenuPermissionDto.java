package org.itcen.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자별 메뉴 권한 DTO
 * 
 * 로그인한 사용자의 메뉴별 세부 권한 정보를 담습니다.
 * Frontend에서 권한 기반 UI 제어에 사용됩니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 메뉴 권한 데이터만 담당
 * - Open/Closed: 새로운 권한 필드 추가 시 확장 가능
 * - Interface Segregation: 권한 정보에 필요한 데이터만 정의
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMenuPermissionDto {

    /**
     * 메뉴 ID
     */
    private Long menuId;

    /**
     * 메뉴 코드 (권한 체크에 사용)
     */
    private String menuCode;

    /**
     * 메뉴명
     */
    private String menuName;

    /**
     * 메뉴 URL
     */
    private String menuUrl;

    /**
     * 읽기 권한 여부
     */
    private boolean canRead;

    /**
     * 쓰기 권한 여부
     */
    private boolean canWrite;

    /**
     * 삭제 권한 여부
     */
    private boolean canDelete;

    /**
     * 사용자가 가진 역할 목록 (참고용)
     */
    private String roles;
}