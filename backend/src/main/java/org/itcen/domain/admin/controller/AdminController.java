package org.itcen.domain.admin.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.admin.dto.*;
import org.itcen.domain.admin.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 관리자 권한 관리 컨트롤러
 * 메뉴 권한 및 사용자 역할 관리 API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 권한 관리 API만 담당
 * - Open/Closed: 새로운 권한 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: ResponseEntity 일관성 유지
 * - Interface Segregation: 관리자 기능만 노출
 * - Dependency Inversion: AdminService 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')") // 임시 비활성화 - 개발/테스트용
public class AdminController {

    private final AdminService adminService;
    
    /**
     * 컨트롤러 테스트용 엔드포인트
     * GET /api/admin/health-check
     */
    @GetMapping("/health-check")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("AdminController is working!");
    }
    
    /**
     * 메뉴 권한 매트릭스 조회
     * 모든 메뉴와 역할별 권한을 매트릭스 형태로 반환
     */
    @GetMapping("/menu-permissions")
    public ResponseEntity<MenuPermissionMatrixDto> getMenuPermissionMatrix() {
        log.info("메뉴 권한 매트릭스 조회 요청");
        MenuPermissionMatrixDto matrix = adminService.getMenuPermissionMatrix();
        return ResponseEntity.ok(matrix);
    }

    /**
     * 특정 메뉴의 권한 설정 조회
     */
    @GetMapping("/menu-permissions/{menuId}")
    public ResponseEntity<List<MenuPermissionDto>> getMenuPermissions(@PathVariable Long menuId) {
        log.info("메뉴 권한 조회 요청 - menuId: {}", menuId);
        List<MenuPermissionDto> permissions = adminService.getMenuPermissions(menuId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 메뉴 권한 업데이트
     */
    @PutMapping("/menu-permissions/{menuId}")
    public ResponseEntity<Void> updateMenuPermissions(
            @PathVariable Long menuId,
            @Valid @RequestBody List<MenuPermissionUpdateDto> updates) {
        log.info("메뉴 권한 업데이트 요청 - menuId: {}, updates: {}", menuId, updates.size());
        adminService.updateMenuPermissions(menuId, updates);
        return ResponseEntity.ok().build();
    }

    /**
     * 특정 역할의 메뉴 권한 조회
     */
    @GetMapping("/menu-permissions/role/{roleName}")
    public ResponseEntity<List<MenuPermissionDto>> getRoleMenuPermissions(@PathVariable String roleName) {
        log.info("역할별 메뉴 권한 조회 요청 - roleName: {}", roleName);
        List<MenuPermissionDto> permissions = adminService.getRoleMenuPermissions(roleName);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 사용자 목록 조회 (권한 관리용)
     * 로그인 페이지에서도 사용할 수 있도록 인증 없이 접근 가능
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserWithRolesDto>> getUsers() {
        log.info("사용자 목록 조회 요청");
        List<UserWithRolesDto> users = adminService.getUsersWithRoles();
        return ResponseEntity.ok(users);
    }

    /**
     * 특정 사용자의 역할 조회
     */
    @GetMapping("/users/{userId}/roles")
    public ResponseEntity<List<UserRoleDto>> getUserRoles(@PathVariable String userId) {
        log.info("사용자 역할 조회 요청 - userId: {}", userId);
        List<UserRoleDto> roles = adminService.getUserRoles(userId);
        return ResponseEntity.ok(roles);
    }

    /**
     * 사용자에게 역할 할당
     */
    @PostMapping("/users/{userId}/roles")
    public ResponseEntity<Void> assignUserRole(
            @PathVariable String userId,
            @Valid @RequestBody UserRoleAssignDto assignDto) {
        log.info("사용자 역할 할당 요청 - userId: {}, roleId: {}", userId, assignDto.getRoleId());
        adminService.assignUserRole(userId, assignDto.getRoleId());
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자의 역할 해제
     */
    @DeleteMapping("/users/{userId}/roles/{roleId}")
    public ResponseEntity<Void> revokeUserRole(
            @PathVariable String userId,
            @PathVariable String roleId) {
        log.info("사용자 역할 해제 요청 - userId: {}, roleId: {}", userId, roleId);
        adminService.revokeUserRole(userId, roleId);
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자 역할 일괄 업데이트
     */
    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<Void> updateUserRoles(
            @PathVariable String userId,
            @Valid @RequestBody List<String> roleIds) {
        log.info("사용자 역할 일괄 업데이트 요청 - userId: {}, roleIds: {}", userId, roleIds);
        adminService.updateUserRoles(userId, roleIds);
        return ResponseEntity.ok().build();
    }

    /**
     * 역할 목록 조회
     */
    @GetMapping("/roles")
    public ResponseEntity<List<RoleDto>> getRoles() {
        log.info("역할 목록 조회 요청");
        List<RoleDto> roles = adminService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * 권한 통계 조회
     */
    @GetMapping("/statistics")
    public ResponseEntity<PermissionStatisticsDto> getPermissionStatistics() {
        log.info("권한 통계 조회 요청");
        PermissionStatisticsDto statistics = adminService.getPermissionStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 메뉴별 권한 통계 조회
     */
    @GetMapping("/statistics/menu-permissions")
    public ResponseEntity<List<MenuPermissionStatDto>> getMenuPermissionStatistics() {
        log.info("메뉴별 권한 통계 조회 요청");
        List<MenuPermissionStatDto> statistics = adminService.getMenuPermissionStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 역할별 권한 통계 조회
     */
    @GetMapping("/statistics/role-permissions")
    public ResponseEntity<List<RolePermissionStatDto>> getRolePermissionStatistics() {
        log.info("역할별 권한 통계 조회 요청");
        List<RolePermissionStatDto> statistics = adminService.getRolePermissionStatistics();
        return ResponseEntity.ok(statistics);
    }

    // 사용자별 메뉴 권한 조회 API (UI 제어용)

    /**
     * 특정 사용자의 메뉴별 권한 조회
     * Frontend에서 권한 기반 UI 제어에 사용
     */
    @GetMapping("/users/{userId}/menu-permissions")
    public ResponseEntity<List<UserMenuPermissionDto>> getUserMenuPermissions(@PathVariable String userId) {
        log.info("사용자별 메뉴 권한 조회 요청 - userId: {}", userId);
        List<UserMenuPermissionDto> permissions = adminService.getUserMenuPermissions(userId);
        log.info("사용자별 메뉴 권한 조회 완료 - userId: {}, permissionCount: {}", userId, permissions.size());
        return ResponseEntity.ok(permissions);
    }

    /**
     * 현재 로그인 사용자의 메뉴별 권한 조회
     * Frontend에서 권한 기반 UI 제어에 사용
     */
    @GetMapping("/current-user/menu-permissions")
    public ResponseEntity<List<UserMenuPermissionDto>> getCurrentUserMenuPermissions(
            @RequestParam(value = "userId", required = false) String userId) {
        // TODO: 실제로는 SecurityContext에서 현재 사용자 ID를 가져와야 함
        // 현재는 임시로 파라미터로 받음
        String currentUserId = userId != null ? userId : "admin"; // 기본값
        
        log.info("현재 사용자 메뉴 권한 조회 요청 - userId: {}", currentUserId);
        List<UserMenuPermissionDto> permissions = adminService.getCurrentUserMenuPermissions(currentUserId);
        log.info("현재 사용자 메뉴 권한 조회 완료 - userId: {}, permissionCount: {}", currentUserId, permissions.size());
        return ResponseEntity.ok(permissions);
    }
}