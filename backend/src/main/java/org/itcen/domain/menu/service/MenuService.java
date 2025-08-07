package org.itcen.domain.menu.service;

import org.itcen.domain.menu.dto.MenuDto;
import org.itcen.domain.menu.entity.Menu;
import org.itcen.domain.menu.entity.MenuPermission;
import org.itcen.domain.menu.repository.MenuRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 메뉴 서비스
 * 메뉴 관련 비즈니스 로직을 처리합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: 인터페이스 구현으로 대체 가능
 * - Interface Segregation: 필요한 메서드만 노출
 * - Dependency Inversion: 리포지토리 인터페이스에 의존
 */
@Service
@Transactional(readOnly = true)
public class MenuService {
    
    private static final Logger logger = LoggerFactory.getLogger(MenuService.class);
    
    private final MenuRepository menuRepository;
    
    public MenuService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }
    
    /**
     * 사용자 역할에 따른 접근 가능한 메뉴 조회
     */
    public List<MenuDto> getAccessibleMenusByRole(String role) {
        logger.info("=== 메뉴 권한 조회 시작 ===");
        logger.info("요청된 역할: {}", role);
        
        // fetch join을 사용하여 N+1 쿼리 문제 해결
        List<Menu> menus = menuRepository.findMenusWithPermissionsByRole(role);
        logger.info("조회된 전체 메뉴 개수: {}", menus.size());
        
        // 직책 현황 메뉴 확인
        Menu positionMenu = menus.stream()
                .filter(m -> "LEDGER_MGMT_POSITION".equals(m.getMenuCode()))
                .findFirst()
                .orElse(null);
        
        if (positionMenu != null) {
            logger.info("직책 현황 메뉴 발견: id={}, permissions={}", 
                positionMenu.getId(), 
                positionMenu.getPermissions().size());
            positionMenu.getPermissions().forEach(p -> 
                logger.info("  - 권한: role={}, canRead={}, canWrite={}, canDelete={}", 
                    p.getRoleName(), p.getCanRead(), p.getCanWrite(), p.getCanDelete()));
        } else {
            logger.warn("직책 현황 메뉴(LEDGER_MGMT_POSITION)를 찾을 수 없음");
        }
        
        // 실제로 접근 가능한 메뉴만 필터링
        List<Menu> accessibleMenus = menus.stream()
                .filter(menu -> {
                    // 권한 데이터가 있는 경우 권한 체크
                    if (menu.getPermissions() != null && !menu.getPermissions().isEmpty()) {
                        boolean hasAccess = menu.getPermissions().stream()
                                .anyMatch(p -> role.equals(p.getRoleName()) && p.getCanRead());
                        if ("LEDGER_MGMT_POSITION".equals(menu.getMenuCode())) {
                            logger.info("직책 현황 메뉴 권한 체크: hasAccess={}", hasAccess);
                        }
                        return hasAccess;
                    }
                    // 권한 데이터가 없는 경우 임시로 모든 사용자에게 읽기 권한 부여
                    else {
                        boolean hasAccess = true; // 임시 수정: 모든 역할에 대해 기본 접근 허용
                        if ("LEDGER_MGMT_POSITION".equals(menu.getMenuCode())) {
                            logger.info("직책 현황 메뉴 기본 권한 체크: role={}, hasAccess={} (임시 허용)", role, hasAccess);
                        }
                        return hasAccess;
                    }
                })
                .collect(Collectors.toList());
        
        // 메뉴가 없는 경우 디버깅 정보 출력
        if (accessibleMenus.isEmpty()) {
            logger.warn("역할 '{}'에 대한 메뉴가 조회되지 않았습니다.", role);
            
            // 전체 메뉴 개수 확인
            long totalMenuCount = menuRepository.count();
            logger.warn("전체 메뉴 개수: {}", totalMenuCount);
            
            // 해당 역할의 권한 데이터 확인
            long permissionCount = menus.stream()
                    .flatMap(menu -> menu.getPermissions().stream())
                    .filter(permission -> role.equals(permission.getRoleName()))
                    .count();
            logger.warn("역할 '{}'의 권한 데이터 개수: {}", role, permissionCount);
            
            logger.info("역할 '{}'에 대한 접근 가능한 메뉴가 없습니다. 빈 목록을 반환합니다.", role);
        }

        // 평면적인 메뉴 목록 반환 (계층 구조 없이)
        return accessibleMenus.stream()
                .map(menu -> {
                    // 해당 역할의 권한 정보 찾기
                    Optional<MenuPermission> permission = menu.getPermissions().stream()
                            .filter(p -> role.equals(p.getRoleName()))
                            .findFirst();
                    
                    if (permission.isPresent()) {
                        MenuPermission perm = permission.get();
                        return MenuDto.fromWithPermissions(menu, perm.getCanRead(), perm.getCanWrite(), perm.getCanDelete());
                    } else {
                        // 권한 정보가 없는 경우 기본값 설정: ADMIN은 모든 권한, 다른 역할은 읽기만
                        boolean defaultCanWrite = "ADMIN".equals(role);
                        boolean defaultCanDelete = "ADMIN".equals(role);
                        return MenuDto.fromWithPermissions(menu, true, defaultCanWrite, defaultCanDelete);
                    }
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 계층형 메뉴 구조 조회
     */
    public List<MenuDto> getMenuHierarchy() {
        List<Menu> rootMenus = menuRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        
        return rootMenus.stream()
                .map(this::buildMenuHierarchy)
                .collect(Collectors.toList());
    }
    
    /**
     * 최상위 메뉴 조회
     */
    public List<MenuDto> getRootMenus() {
        List<Menu> rootMenus = menuRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        return MenuDto.fromList(rootMenus);
    }
    
    /**
     * 특정 부모 메뉴의 하위 메뉴 조회
     */
    public List<MenuDto> getChildMenus(Long parentId) {
        List<Menu> childMenus = menuRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(parentId);
        return MenuDto.fromList(childMenus);
    }
    
    /**
     * 메뉴 코드로 메뉴 조회
     */
    public MenuDto getMenuByCode(String menuCode) {
        Optional<Menu> menu = menuRepository.findByMenuCode(menuCode);
        return menu.map(MenuDto::from).orElse(null);
    }
    
    /**
     * 메뉴 검색
     */
    public List<MenuDto> searchMenus(String keyword) {
        List<Menu> menus = menuRepository.searchMenusByKeyword(keyword);
        return MenuDto.fromList(menus);
    }
    
    /**
     * 메뉴 ID로 메뉴 조회
     */
    public MenuDto getMenuById(Long id) {
        Optional<Menu> menu = menuRepository.findById(id);
        return menu.map(MenuDto::from).orElse(null);
    }
    
    /**
     * 특정 레벨의 메뉴 조회
     */
    public List<MenuDto> getMenusByLevel(Integer level) {
        List<Menu> menus = menuRepository.findByMenuLevelAndIsActiveTrueOrderBySortOrderAsc(level);
        return MenuDto.fromList(menus);
    }
    
    /**
     * 메뉴 URL로 메뉴 조회
     */
    public MenuDto getMenuByUrl(String menuUrl) {
        Optional<Menu> menu = menuRepository.findByMenuUrlAndIsActiveTrue(menuUrl);
        return menu.map(MenuDto::from).orElse(null);
    }
    
    /**
     * 활성화된 모든 메뉴 조회
     */
    public List<MenuDto> getAllActiveMenus() {
        List<Menu> menus = menuRepository.findByIsActiveTrueOrderByMenuLevelAscSortOrderAsc();
        return MenuDto.fromList(menus);
    }
    
    /**
     * 표시 가능한 모든 메뉴 조회
     */
    public List<MenuDto> getAllVisibleMenus() {
        List<Menu> menus = menuRepository.findByIsActiveTrueAndIsVisibleTrueOrderByMenuLevelAscSortOrderAsc();
        return MenuDto.fromList(menus);
    }
    
    /**
     * 메뉴 계층 구조 재귀적으로 구성
     */
    private MenuDto buildMenuHierarchy(Menu menu) {
        MenuDto menuDto = MenuDto.from(menu);
        
        // 하위 메뉴가 있는 경우 재귀적으로 처리
        if (menu.hasChildren()) {
            List<MenuDto> children = menu.getChildren().stream()
                    .filter(child -> child.getIsActive() && child.getIsVisible())
                    .sorted((a, b) -> a.getSortOrder().compareTo(b.getSortOrder()))
                    .map(this::buildMenuHierarchy)
                    .collect(Collectors.toList());
            menuDto.setChildren(children);
        }
        
        return menuDto;
    }
    
    /**
     * 메뉴 코드 존재 여부 확인
     */
    public boolean existsByMenuCode(String menuCode) {
        return menuRepository.existsByMenuCode(menuCode);
    }
    
    /**
     * 특정 부모 메뉴의 활성 하위 메뉴 개수 조회
     */
    public long countActiveChildrenByParentId(Long parentId) {
        return menuRepository.countActiveChildrenByParentId(parentId);
    }
} 