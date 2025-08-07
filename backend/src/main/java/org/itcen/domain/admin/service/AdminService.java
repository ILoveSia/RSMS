package org.itcen.domain.admin.service;

import org.itcen.domain.admin.dto.*;

import java.util.List;

/**
 * 관리자 서비스 인터페이스
 * 권한 관리 관련 비즈니스 로직을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 권한 관리 비즈니스 로직만 담당
 * - Open/Closed: 새로운 권한 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: 구현체 간 호환성 보장
 * - Interface Segregation: 권한 관리 관련 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface AdminService {

    // 메뉴 권한 관리
    
    /**
     * 메뉴 권한 매트릭스 조회
     * 모든 메뉴와 역할별 권한을 매트릭스 형태로 반환
     */
    MenuPermissionMatrixDto getMenuPermissionMatrix();
    
    /**
     * 특정 메뉴의 권한 설정 조회
     */
    List<MenuPermissionDto> getMenuPermissions(Long menuId);
    
    /**
     * 메뉴 권한 업데이트
     */
    void updateMenuPermissions(Long menuId, List<MenuPermissionUpdateDto> updates);
    
    /**
     * 특정 역할의 메뉴 권한 조회
     */
    List<MenuPermissionDto> getRoleMenuPermissions(String roleName);

    // 사용자 역할 관리
    
    /**
     * 사용자 목록 조회 (권한 정보 포함)
     */
    List<UserWithRolesDto> getUsersWithRoles();
    
    /**
     * 특정 사용자의 역할 조회
     */
    List<UserRoleDto> getUserRoles(String userId);
    
    /**
     * 사용자에게 역할 할당
     */
    void assignUserRole(String userId, String roleId);
    
    /**
     * 사용자의 역할 해제
     */
    void revokeUserRole(String userId, String roleId);
    
    /**
     * 사용자 역할 일괄 업데이트
     */
    void updateUserRoles(String userId, List<String> roleIds);

    // 역할 관리
    
    /**
     * 모든 역할 조회
     */
    List<RoleDto> getAllRoles();

    // 통계 및 모니터링
    
    /**
     * 권한 통계 조회
     */
    PermissionStatisticsDto getPermissionStatistics();
    
    /**
     * 메뉴별 권한 통계 조회
     */
    List<MenuPermissionStatDto> getMenuPermissionStatistics();
    
    /**
     * 역할별 권한 통계 조회
     */
    List<RolePermissionStatDto> getRolePermissionStatistics();

    // 사용자별 메뉴 권한 조회 (UI 제어용)
    
    /**
     * 특정 사용자의 메뉴별 권한 조회
     * Frontend에서 권한 기반 UI 제어에 사용
     * 
     * @param userId 사용자 ID
     * @return 사용자의 메뉴별 세부 권한 목록
     */
    List<UserMenuPermissionDto> getUserMenuPermissions(String userId);
    
    /**
     * 현재 로그인 사용자의 메뉴별 권한 조회
     * Frontend에서 권한 기반 UI 제어에 사용
     * 
     * @param userId 현재 로그인 사용자 ID
     * @return 현재 사용자의 메뉴별 세부 권한 목록
     */
    List<UserMenuPermissionDto> getCurrentUserMenuPermissions(String userId);
}