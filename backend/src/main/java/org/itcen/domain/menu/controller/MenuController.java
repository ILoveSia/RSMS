package org.itcen.domain.menu.controller;

import org.itcen.domain.menu.dto.MenuDto;
import org.itcen.domain.menu.service.MenuService;
import org.itcen.domain.menu.service.MenuInitializationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 메뉴 컨트롤러
 * 메뉴 관련 API를 제공합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 API만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Interface Segregation: 필요한 API만 노출
 * - Dependency Inversion: 서비스 인터페이스에 의존
 */
@RestController
@RequestMapping("/menus")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MenuController {
    
    private static final Logger logger = LoggerFactory.getLogger(MenuController.class);
    
    private final MenuService menuService;
    private final MenuInitializationService menuInitializationService;
    
    public MenuController(MenuService menuService, MenuInitializationService menuInitializationService) {
        this.menuService = menuService;
        this.menuInitializationService = menuInitializationService;
    }
    
    /**
     * 사용자 역할에 따른 접근 가능한 메뉴 조회
     */
    @GetMapping("/accessible")
    public ResponseEntity<List<MenuDto>> getAccessibleMenus(
            @RequestParam(defaultValue = "USER") String role) {
        
        try {
            List<MenuDto> menus = menuService.getAccessibleMenusByRole(role);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            logger.error("메뉴 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 계층형 메뉴 구조 조회
     */
    @GetMapping("/hierarchy")
    public ResponseEntity<List<MenuDto>> getMenuHierarchy() {
        
        try {
            List<MenuDto> menus = menuService.getMenuHierarchy();
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            logger.error("계층형 메뉴 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 최상위 메뉴 조회
     */
    @GetMapping("/root")
    public ResponseEntity<List<MenuDto>> getRootMenus() {
        
        try {
            List<MenuDto> menus = menuService.getRootMenus();
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            logger.error("최상위 메뉴 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 부모 메뉴의 하위 메뉴 조회
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<MenuDto>> getChildMenus(@PathVariable Long parentId) {
        
        try {
            List<MenuDto> menus = menuService.getChildMenus(parentId);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            logger.error("하위 메뉴 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 메뉴 코드로 메뉴 조회
     */
    @GetMapping("/code/{menuCode}")
    public ResponseEntity<MenuDto> getMenuByCode(@PathVariable String menuCode) {
        
        try {
            MenuDto menu = menuService.getMenuByCode(menuCode);
            if (menu != null) {
                return ResponseEntity.ok(menu);
            } else {
                logger.warn("메뉴를 찾을 수 없음 - 코드: {}", menuCode);
                // 메뉴가 없을 경우 빈 객체로 응답 (404 대신)
                MenuDto emptyMenu = new MenuDto();
                emptyMenu.setMenuCode(menuCode);
                emptyMenu.setMenuName("메뉴 없음");
                return ResponseEntity.ok(emptyMenu);
            }
        } catch (Exception e) {
            logger.error("메뉴 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 메뉴 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<MenuDto>> searchMenus(@RequestParam String keyword) {
        
        try {
            List<MenuDto> menus = menuService.searchMenus(keyword);
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            logger.error("메뉴 검색 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 메뉴 강제 재초기화 (개발용)
     */
    @PostMapping("/reinitialize")
    public ResponseEntity<String> reinitializeMenus() {
        
        try {
            menuInitializationService.forceReinitializeMenus();
            return ResponseEntity.ok("메뉴가 성공적으로 재초기화되었습니다.");
        } catch (Exception e) {
            logger.error("메뉴 강제 재초기화 실패", e);
            return ResponseEntity.internalServerError().body("메뉴 재초기화 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 