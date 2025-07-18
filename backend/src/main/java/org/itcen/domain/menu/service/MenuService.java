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
        logger.info("역할별 접근 가능한 메뉴 조회 - 역할: {}", role);
        
        // fetch join을 사용하여 N+1 쿼리 문제 해결
        List<Menu> menus = menuRepository.findMenusWithPermissionsByRole(role);
        
        // 실제로 접근 가능한 메뉴만 필터링
        List<Menu> accessibleMenus = menus.stream()
                .filter(menu -> menu.getPermissions().stream()
                        .anyMatch(p -> role.equals(p.getRoleName()) && p.getCanRead()))
                .collect(Collectors.toList());
        
        logger.info("조회된 메뉴 개수: {}", accessibleMenus.size());
        
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
            
            // 임시로 모든 활성 메뉴 반환 (디버깅용)
            if ("USER".equals(role)) {
                logger.warn("USER 역할에 대해 모든 활성 메뉴를 반환합니다 (임시 조치)");
                List<Menu> activeMenus = menuRepository.findByIsActiveTrueAndIsVisibleTrueOrderByMenuLevelAscSortOrderAsc();
                return activeMenus.stream()
                        .map(menu -> MenuDto.fromWithPermissions(menu, true, false, false))
                        .collect(Collectors.toList());
            }
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
                        return MenuDto.from(menu);
                    }
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 계층형 메뉴 구조 조회
     */
    public List<MenuDto> getMenuHierarchy() {
        logger.debug("계층형 메뉴 구조 조회");
        
        List<Menu> rootMenus = menuRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        
        return rootMenus.stream()
                .map(this::buildMenuHierarchy)
                .collect(Collectors.toList());
    }
    
    /**
     * 최상위 메뉴 조회
     */
    public List<MenuDto> getRootMenus() {
        logger.debug("최상위 메뉴 조회");
        
        List<Menu> rootMenus = menuRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
        return MenuDto.fromList(rootMenus);
    }
    
    /**
     * 특정 부모 메뉴의 하위 메뉴 조회
     */
    public List<MenuDto> getChildMenus(Long parentId) {
        logger.debug("하위 메뉴 조회 - 부모 ID: {}", parentId);
        
        List<Menu> childMenus = menuRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(parentId);
        return MenuDto.fromList(childMenus);
    }
    
    /**
     * 메뉴 코드로 메뉴 조회
     */
    public MenuDto getMenuByCode(String menuCode) {
        logger.debug("메뉴 코드로 조회 - 코드: {}", menuCode);
        
        Optional<Menu> menu = menuRepository.findByMenuCode(menuCode);
        return menu.map(MenuDto::from).orElse(null);
    }
    
    /**
     * 메뉴 검색
     */
    public List<MenuDto> searchMenus(String keyword) {
        logger.debug("메뉴 검색 - 키워드: {}", keyword);
        
        List<Menu> menus = menuRepository.searchMenusByKeyword(keyword);
        return MenuDto.fromList(menus);
    }
    
    /**
     * 메뉴 ID로 메뉴 조회
     */
    public MenuDto getMenuById(Long id) {
        logger.debug("메뉴 ID로 조회 - ID: {}", id);
        
        Optional<Menu> menu = menuRepository.findById(id);
        return menu.map(MenuDto::from).orElse(null);
    }
    
    /**
     * 특정 레벨의 메뉴 조회
     */
    public List<MenuDto> getMenusByLevel(Integer level) {
        logger.debug("레벨별 메뉴 조회 - 레벨: {}", level);
        
        List<Menu> menus = menuRepository.findByMenuLevelAndIsActiveTrueOrderBySortOrderAsc(level);
        return MenuDto.fromList(menus);
    }
    
    /**
     * 메뉴 URL로 메뉴 조회
     */
    public MenuDto getMenuByUrl(String menuUrl) {
        logger.debug("메뉴 URL로 조회 - URL: {}", menuUrl);
        
        Optional<Menu> menu = menuRepository.findByMenuUrlAndIsActiveTrue(menuUrl);
        return menu.map(MenuDto::from).orElse(null);
    }
    
    /**
     * 활성화된 모든 메뉴 조회
     */
    public List<MenuDto> getAllActiveMenus() {
        logger.debug("활성화된 모든 메뉴 조회");
        
        List<Menu> menus = menuRepository.findByIsActiveTrueOrderByMenuLevelAscSortOrderAsc();
        return MenuDto.fromList(menus);
    }
    
    /**
     * 표시 가능한 모든 메뉴 조회
     */
    public List<MenuDto> getAllVisibleMenus() {
        logger.debug("표시 가능한 모든 메뉴 조회");
        
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
        logger.debug("메뉴 코드 존재 여부 확인 - 코드: {}", menuCode);
        
        return menuRepository.existsByMenuCode(menuCode);
    }
    
    /**
     * 특정 부모 메뉴의 활성 하위 메뉴 개수 조회
     */
    public long countActiveChildrenByParentId(Long parentId) {
        logger.debug("활성 하위 메뉴 개수 조회 - 부모 ID: {}", parentId);
        
        return menuRepository.countActiveChildrenByParentId(parentId);
    }
} 