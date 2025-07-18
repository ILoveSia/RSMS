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
        
        logger.info("접근 가능한 메뉴 조회 요청 - 역할: {}", role);
        
        try {
            List<MenuDto> menus = menuService.getAccessibleMenusByRole(role);
            logger.info("메뉴 조회 성공 - 개수: {}", menus.size());
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
        
        logger.info("계층형 메뉴 구조 조회 요청");
        
        try {
            List<MenuDto> menus = menuService.getMenuHierarchy();
            logger.info("계층형 메뉴 조회 성공 - 개수: {}", menus.size());
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
        
        logger.info("최상위 메뉴 조회 요청");
        
        try {
            List<MenuDto> menus = menuService.getRootMenus();
            logger.info("최상위 메뉴 조회 성공 - 개수: {}", menus.size());
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
        
        logger.info("하위 메뉴 조회 요청 - 부모 ID: {}", parentId);
        
        try {
            List<MenuDto> menus = menuService.getChildMenus(parentId);
            logger.info("하위 메뉴 조회 성공 - 개수: {}", menus.size());
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
        
        logger.info("메뉴 코드로 조회 요청 - 코드: {}", menuCode);
        
        try {
            MenuDto menu = menuService.getMenuByCode(menuCode);
            if (menu != null) {
                logger.info("메뉴 조회 성공 - 코드: {}, 이름: {}", menuCode, menu.getMenuName());
                return ResponseEntity.ok(menu);
            } else {
                logger.warn("메뉴를 찾을 수 없음 - 코드: {}", menuCode);
                return ResponseEntity.notFound().build();
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
        
        logger.info("메뉴 검색 요청 - 키워드: {}", keyword);
        
        try {
            List<MenuDto> menus = menuService.searchMenus(keyword);
            logger.info("메뉴 검색 성공 - 키워드: {}, 개수: {}", keyword, menus.size());
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
        
        logger.info("메뉴 강제 재초기화 요청");
        
        try {
            menuInitializationService.forceReinitializeMenus();
            logger.info("메뉴 강제 재초기화 완료");
            return ResponseEntity.ok("메뉴가 성공적으로 재초기화되었습니다.");
        } catch (Exception e) {
            logger.error("메뉴 강제 재초기화 실패", e);
            return ResponseEntity.internalServerError().body("메뉴 재초기화 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 