package org.itcen.domain.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.auth.domain.permission.Role;
import org.itcen.auth.domain.permission.UserRole;
import org.itcen.auth.repository.RoleRepository;
import org.itcen.auth.repository.UserRoleRepository;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.admin.dto.*;
// import org.itcen.domain.departments.entity.Department;
import org.itcen.domain.employee.entity.Employee;
import org.itcen.domain.menu.entity.Menu;
import org.itcen.domain.menu.entity.MenuPermission;
import org.itcen.domain.menu.repository.MenuPermissionRepository;
import org.itcen.domain.menu.repository.MenuRepository;
import org.itcen.domain.user.entity.User;
import org.itcen.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 관리자 서비스 구현체
 * 권한 관리 관련 비즈니스 로직을 구현합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 권한 관리 비즈니스 로직만 담당
 * - Open/Closed: 새로운 권한 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: AdminService 인터페이스 준수
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final MenuRepository menuRepository;
    private final MenuPermissionRepository menuPermissionRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    @Override
    public MenuPermissionMatrixDto getMenuPermissionMatrix() {
        log.debug("메뉴 권한 매트릭스 조회 시작");
        
        // 모든 메뉴 조회
        List<Menu> menus = menuRepository.findAll();
        List<MenuPermissionMatrixDto.MenuInfo> menuInfos = menus.stream()
                .map(menu -> MenuPermissionMatrixDto.MenuInfo.builder()
                        .menuId(menu.getId())
                        .menuName(menu.getMenuName())
                        .menuPath(menu.getMenuUrl())
                        .menuOrder(menu.getSortOrder())
                        .parentId(menu.getParent() != null ? menu.getParent().getId() : null)
                        .level(menu.getMenuLevel())
                        .build())
                .collect(Collectors.toList());

        // 모든 활성 역할 조회
        List<Role> roles = roleRepository.findAllActive();
        List<String> roleNames = roles.stream()
                .map(Role::getRoleId)
                .collect(Collectors.toList());

        // 모든 메뉴 권한 조회
        List<MenuPermission> permissions = menuPermissionRepository.findAllWithMenu();
        
        // 권한 매트릭스 구성
        Map<Long, Map<String, MenuPermissionMatrixDto.PermissionSet>> permissionMatrix = new HashMap<>();
        
        for (Menu menu : menus) {
            Map<String, MenuPermissionMatrixDto.PermissionSet> rolePermissions = new HashMap<>();
            
            // 각 역할에 대해 권한 설정
            for (String roleName : roleNames) {
                MenuPermission permission = permissions.stream()
                        .filter(p -> p.getMenu().getId().equals(menu.getId()) && p.getRoleName().equals(roleName))
                        .findFirst()
                        .orElse(null);
                
                if (permission != null) {
                    rolePermissions.put(roleName, new MenuPermissionMatrixDto.PermissionSet(
                            permission.getCanRead(),
                            permission.getCanWrite(),
                            permission.getCanDelete()
                    ));
                } else {
                    // 기본값: 권한 없음
                    rolePermissions.put(roleName, new MenuPermissionMatrixDto.PermissionSet(false, false, false));
                }
            }
            
            permissionMatrix.put(menu.getId(), rolePermissions);
        }

        log.debug("메뉴 권한 매트릭스 조회 완료 - 메뉴: {}, 역할: {}", menuInfos.size(), roleNames.size());
        
        return MenuPermissionMatrixDto.builder()
                .menus(menuInfos)
                .roles(roleNames)
                .permissionMatrix(permissionMatrix)
                .build();
    }

    @Override
    public List<MenuPermissionDto> getMenuPermissions(Long menuId) {
        log.debug("메뉴 권한 조회 시작 - menuId: {}", menuId);
        
        List<MenuPermission> permissions = menuPermissionRepository.findByMenuId(menuId);
        
        return permissions.stream()
                .map(this::convertToMenuPermissionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateMenuPermissions(Long menuId, List<MenuPermissionUpdateDto> updates) {
        log.debug("메뉴 권한 업데이트 시작 - menuId: {}, updates: {}", menuId, updates.size());
        
        // 메뉴 존재 확인
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new BusinessException("메뉴를 찾을 수 없습니다: " + menuId));
        
        for (MenuPermissionUpdateDto update : updates) {
            // 권한 유효성 검증
            if (!update.isValid()) {
                throw new BusinessException("유효하지 않은 권한 설정입니다: " + update.getRoleName());
            }
            
            // 기존 권한 조회 또는 생성
            MenuPermission permission = menuPermissionRepository
                    .findByMenuIdAndRoleName(menuId, update.getRoleName())
                    .orElse(new MenuPermission(menu, update.getRoleName(), false, false, false));
            
            // 권한 업데이트
            permission.setCanRead(update.getCanRead());
            permission.setCanWrite(update.getCanWrite());
            permission.setCanDelete(update.getCanDelete());
            
            menuPermissionRepository.save(permission);
        }
        
        log.debug("메뉴 권한 업데이트 완료 - menuId: {}", menuId);
    }

    @Override
    public List<MenuPermissionDto> getRoleMenuPermissions(String roleName) {
        log.debug("역할별 메뉴 권한 조회 시작 - roleName: {}", roleName);
        
        List<MenuPermission> permissions = menuPermissionRepository.findByRoleName(roleName);
        
        return permissions.stream()
                .map(this::convertToMenuPermissionDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserWithRolesDto> getUsersWithRoles() {
        log.debug("사용자 목록 조회 시작");
        
        // 사용자, 직원 정보를 조인하여 조회
        List<Object[]> usersWithEmployee = userRepository.findUsersWithEmployee();
        List<UserRole> allUserRoles = userRoleRepository.findAllActive();
        
        // 사용자별 역할 그룹핑
        Map<String, List<UserRole>> userRoleMap = allUserRoles.stream()
                .collect(Collectors.groupingBy(UserRole::getUserId));
        
        return usersWithEmployee.stream()
                .map(result -> {
                    User user = (User) result[0];
                    Employee employee = (Employee) result[1];  // null일 수 있음
                    
                    return convertToUserWithRolesDto(user, employee, userRoleMap.get(user.getId()));
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UserRoleDto> getUserRoles(String userId) {
        log.debug("사용자 역할 조회 시작 - userId: {}", userId);
        
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(userId);
        
        return userRoles.stream()
                .map(this::convertToUserRoleDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignUserRole(String userId, String roleId) {
        log.debug("사용자 역할 할당 시작 - userId: {}, roleId: {}", userId, roleId);
        
        // 사용자 존재 확인
        if (!userRepository.existsById(userId)) {
            throw new BusinessException("사용자를 찾을 수 없습니다: " + userId);
        }
        
        // 역할 존재 확인
        if (!roleRepository.existsActiveRole(roleId)) {
            throw new BusinessException("역할을 찾을 수 없습니다: " + roleId);
        }
        
        // 이미 할당된 역할인지 확인
        if (userRoleRepository.existsActiveUserRole(userId, roleId)) {
            throw new BusinessException("이미 할당된 역할입니다: " + roleId);
        }
        
        // 역할 할당
        UserRole userRole = UserRole.createMapping(userId, roleId);
        userRoleRepository.save(userRole);
        
        log.debug("사용자 역할 할당 완료 - userId: {}, roleId: {}", userId, roleId);
    }

    @Override
    @Transactional
    public void revokeUserRole(String userId, String roleId) {
        log.debug("사용자 역할 해제 시작 - userId: {}, roleId: {}", userId, roleId);
        
        UserRole userRole = userRoleRepository.findByUserIdAndRoleId(userId, roleId);
        if (userRole == null) {
            throw new BusinessException("할당된 역할을 찾을 수 없습니다: " + roleId);
        }
        
        // 역할 비활성화
        userRole.deactivate();
        userRoleRepository.save(userRole);
        
        log.debug("사용자 역할 해제 완료 - userId: {}, roleId: {}", userId, roleId);
    }

    @Override
    @Transactional
    public void updateUserRoles(String userId, List<String> roleIds) {
        log.debug("사용자 역할 일괄 업데이트 시작 - userId: {}, roleIds: {}", userId, roleIds);
        
        // 사용자 존재 확인
        if (!userRepository.existsById(userId)) {
            throw new BusinessException("사용자를 찾을 수 없습니다: " + userId);
        }
        
        // 기존 역할 모두 비활성화
        List<UserRole> existingRoles = userRoleRepository.findActiveRolesByUserId(userId);
        existingRoles.forEach(UserRole::deactivate);
        userRoleRepository.saveAll(existingRoles);
        
        // 새로운 역할 할당
        for (String roleId : roleIds) {
            if (!roleRepository.existsActiveRole(roleId)) {
                throw new BusinessException("역할을 찾을 수 없습니다: " + roleId);
            }
            
            UserRole userRole = userRoleRepository.findByUserIdAndRoleId(userId, roleId);
            if (userRole != null) {
                userRole.activate();
            } else {
                userRole = UserRole.createMapping(userId, roleId);
            }
            userRoleRepository.save(userRole);
        }
        
        log.debug("사용자 역할 일괄 업데이트 완료 - userId: {}", userId);
    }

    @Override
    public List<RoleDto> getAllRoles() {
        log.debug("역할 목록 조회 시작");
        
        List<Role> roles = roleRepository.findAllActive();
        Map<String, Long> userCounts = getUserCountsByRole();
        Map<String, Long> permissionCounts = getPermissionCountsByRole();
        
        return roles.stream()
                .map(role -> RoleDto.builder()
                        .roleId(role.getRoleId())
                        .roleName(role.getRoleName())
                        .roleDescription(role.getDescription())
                        .isActive(role.isActive())
                        .userCount(userCounts.getOrDefault(role.getRoleId(), 0L).intValue())
                        .permissionCount(permissionCounts.getOrDefault(role.getRoleId(), 0L).intValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public PermissionStatisticsDto getPermissionStatistics() {
        log.debug("권한 통계 조회 시작");
        
        // 사용자 통계
        long totalUsers = userRepository.count();
        List<UserRole> activeUserRoles = userRoleRepository.findAllActive();
        long usersWithRoles = activeUserRoles.stream()
                .map(UserRole::getUserId)
                .distinct()
                .count();
        
        // 역할 통계
        List<Role> activeRoles = roleRepository.findAllActive();
        
        // 메뉴 통계
        long totalMenus = menuRepository.count();
        List<MenuPermission> allPermissions = menuPermissionRepository.findAll();
        long menusWithPermissions = allPermissions.stream()
                .map(mp -> mp.getMenu().getId())
                .distinct()
                .count();
        
        return PermissionStatisticsDto.builder()
                .userStats(PermissionStatisticsDto.UserStats.builder()
                        .totalUsers((int) totalUsers)
                        .activeUsers((int) totalUsers) // 모든 사용자가 활성으로 가정
                        .usersWithRoles((int) usersWithRoles)
                        .build())
                .roleStats(PermissionStatisticsDto.RoleStats.builder()
                        .totalRoles(activeRoles.size())
                        .activeRoles(activeRoles.size())
                        .build())
                .menuStats(PermissionStatisticsDto.MenuStats.builder()
                        .totalMenus((int) totalMenus)
                        .menusWithPermissions((int) menusWithPermissions)
                        .build())
                .build();
    }

    @Override
    public List<MenuPermissionStatDto> getMenuPermissionStatistics() {
        log.debug("메뉴별 권한 통계 조회 시작");
        
        List<Object[]> stats = menuPermissionRepository.getMenuPermissionStatistics();
        int totalRoles = roleRepository.findAllActive().size();
        
        return stats.stream()
                .map(stat -> MenuPermissionStatDto.builder()
                        .menuId((Long) stat[0])
                        .menuName((String) stat[1])
                        .readCount(((Number) stat[2]).intValue())
                        .writeCount(((Number) stat[3]).intValue())
                        .deleteCount(((Number) stat[4]).intValue())
                        .totalRoles(totalRoles)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<RolePermissionStatDto> getRolePermissionStatistics() {
        log.debug("역할별 권한 통계 조회 시작");
        
        List<Object[]> stats = menuPermissionRepository.getRolePermissionStatistics();
        int totalMenus = (int) menuRepository.count();
        Map<String, Long> userCounts = getUserCountsByRole();
        
        return stats.stream()
                .map(stat -> {
                    String roleName = (String) stat[0];
                    return RolePermissionStatDto.builder()
                            .roleName(roleName)
                            .userCount(userCounts.getOrDefault(roleName, 0L).intValue())
                            .readCount(((Number) stat[1]).intValue())
                            .writeCount(((Number) stat[2]).intValue())
                            .deleteCount(((Number) stat[3]).intValue())
                            .totalMenus(totalMenus)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Private Helper Methods
    
    private MenuPermissionDto convertToMenuPermissionDto(MenuPermission permission) {
        return MenuPermissionDto.builder()
                .id(permission.getId())
                .menuId(permission.getMenu().getId())
                .menuName(permission.getMenu().getMenuName())
                .menuPath(permission.getMenu().getMenuUrl())
                .roleName(permission.getRoleName())
                .canRead(permission.getCanRead())
                .canWrite(permission.getCanWrite())
                .canDelete(permission.getCanDelete())
                .build();
    }
    
    private UserWithRolesDto convertToUserWithRolesDto(User user, Employee employee, List<UserRole> userRoles) {
        List<UserWithRolesDto.UserRoleInfo> roleInfos = Optional.ofNullable(userRoles)
                .orElse(Collections.emptyList())
                .stream()
                .map(ur -> UserWithRolesDto.UserRoleInfo.builder()
                        .roleId(ur.getRoleId())
                        .assignedAt(ur.getAssignedAt())
                        .assignedBy(ur.getAssignedBy())
                        .isActive(ur.isActive())
                        .build())
                .collect(Collectors.toList());
        
        return UserWithRolesDto.builder()
                .userId(user.getId())
                .userName(employee != null ? employee.getEmpName() : null) // Employee empName 사용
                .empNo(user.getEmpNo())
                .department(employee != null ? employee.getDeptCode() : null)
                .departmentName(employee != null ? employee.getDeptName() : null)
                // .position(user.getJobTitleCd()) // job_title_cd 제거로 사용자 엔티티에서 제공하지 않음
                .positionName(employee != null ? employee.getPositionName() : null)
                .isActive(true) // 기본값
                .createdAt(user.getCreatedAt())
                .roles(roleInfos)
                .build();
    }
    
    private UserRoleDto convertToUserRoleDto(UserRole userRole) {
        return UserRoleDto.builder()
                .userId(userRole.getUserId())
                .roleId(userRole.getRoleId())
                .assignedAt(userRole.getAssignedAt())
                .assignedBy(userRole.getAssignedBy())
                .isActive(userRole.isActive())
                .build();
    }
    
    private Map<String, Long> getUserCountsByRole() {
        List<Object[]> counts = userRoleRepository.countUsersByRole();
        return counts.stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> (Long) arr[1]
                ));
    }
    
    private Map<String, Long> getPermissionCountsByRole() {
        List<Object[]> stats = menuPermissionRepository.getRolePermissionStatistics();
        return stats.stream()
                .collect(Collectors.toMap(
                        arr -> (String) arr[0],
                        arr -> ((Number) arr[1]).longValue() + ((Number) arr[2]).longValue() + ((Number) arr[3]).longValue()
                ));
    }

    @Override
    public List<UserMenuPermissionDto> getUserMenuPermissions(String userId) {
        log.info("사용자별 메뉴 권한 조회 요청: userId={}", userId);
        
        // 1. 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다: " + userId, "USER_NOT_FOUND"));
        
        // 2. 사용자의 역할 조회
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(userId);
        Set<String> roleNames = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toSet());
        
        log.info("사용자 역할 조회 완료: userId={}, roles={}", userId, roleNames);
        
        if (roleNames.isEmpty()) {
            log.warn("사용자에게 할당된 역할이 없습니다: userId={}", userId);
            return Collections.emptyList();
        }
        
        // 3. 모든 메뉴 조회
        List<Menu> allMenus = menuRepository.findByIsActiveTrueOrderByMenuLevelAscSortOrderAsc();
        
        // 4. 각 메뉴별로 사용자의 권한 계산
        List<UserMenuPermissionDto> result = allMenus.stream()
                .map(menu -> {
                    // 해당 메뉴에 대한 사용자 역할들의 권한 조회
                    List<MenuPermission> menuPermissions = menuPermissionRepository.findByMenuIdAndRoleNameIn(menu.getId(), roleNames);
                    
                    // 권한 통합 (OR 연산 - 하나라도 true면 true)
                    boolean canRead = menuPermissions.stream().anyMatch(mp -> mp.getCanRead());
                    boolean canWrite = menuPermissions.stream().anyMatch(mp -> mp.getCanWrite());
                    boolean canDelete = menuPermissions.stream().anyMatch(mp -> mp.getCanDelete());
                    
                    // 역할 목록 문자열 생성
                    String rolesStr = String.join(", ", roleNames);
                    
                    return UserMenuPermissionDto.builder()
                            .menuId(menu.getId())
                            .menuCode(menu.getMenuCode())
                            .menuName(menu.getMenuName())
                            .menuUrl(menu.getMenuUrl())
                            .canRead(canRead)
                            .canWrite(canWrite)
                            .canDelete(canDelete)
                            .roles(rolesStr)
                            .build();
                })
                .collect(Collectors.toList());
        
        log.info("사용자별 메뉴 권한 조회 완료: userId={}, menuCount={}", userId, result.size());
        return result;
    }
    
    @Override
    public List<UserMenuPermissionDto> getCurrentUserMenuPermissions(String userId) {
        log.info("현재 사용자 메뉴 권한 조회 요청: userId={}", userId);
        return getUserMenuPermissions(userId);
    }
}