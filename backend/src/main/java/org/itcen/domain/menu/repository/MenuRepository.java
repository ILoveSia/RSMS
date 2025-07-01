package org.itcen.domain.menu.repository;

import org.itcen.domain.menu.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 메뉴 리포지토리
 * 메뉴 데이터 접근을 담당합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 데이터 접근만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 인터페이스 기반 설계
 */
@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    /**
     * 메뉴 코드로 메뉴 조회
     */
    Optional<Menu> findByMenuCode(String menuCode);
    
    /**
     * 활성화된 메뉴만 조회
     */
    List<Menu> findByIsActiveTrueOrderByMenuLevelAscSortOrderAsc();
    
    /**
     * 표시 가능한 메뉴만 조회
     */
    List<Menu> findByIsActiveTrueAndIsVisibleTrueOrderByMenuLevelAscSortOrderAsc();
    
    /**
     * 최상위 메뉴 조회 (parent_id가 null인 메뉴)
     */
    List<Menu> findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc();
    
    /**
     * 특정 부모 메뉴의 하위 메뉴 조회
     */
    List<Menu> findByParentIdAndIsActiveTrueOrderBySortOrderAsc(Long parentId);
    
    /**
     * 특정 레벨의 메뉴 조회
     */
    List<Menu> findByMenuLevelAndIsActiveTrueOrderBySortOrderAsc(Integer menuLevel);
    
    /**
     * 메뉴 코드 존재 여부 확인
     */
    boolean existsByMenuCode(String menuCode);
    
    /**
     * 계층형 메뉴 구조 조회 (재귀 쿼리)
     */
    @Query(value = """
        WITH RECURSIVE menu_tree AS (
            -- 최상위 메뉴
            SELECT 
                id, menu_code, menu_name, menu_name_en, parent_id, 
                menu_level, sort_order, menu_url, icon_class, 
                is_active, is_visible, description,
                CAST(menu_name AS TEXT) as path,
                CAST(LPAD(sort_order::TEXT, 3, '0') AS TEXT) as sort_path
            FROM menus 
            WHERE parent_id IS NULL AND is_active = true
            
            UNION ALL
            
            -- 하위 메뉴들
            SELECT 
                m.id, m.menu_code, m.menu_name, m.menu_name_en, m.parent_id,
                m.menu_level, m.sort_order, m.menu_url, m.icon_class,
                m.is_active, m.is_visible, m.description,
                mt.path || ' > ' || m.menu_name,
                mt.sort_path || '-' || LPAD(m.sort_order::TEXT, 3, '0')
            FROM menus m
            INNER JOIN menu_tree mt ON m.parent_id = mt.id
            WHERE m.is_active = true
        )
        SELECT * FROM menu_tree ORDER BY sort_path
        """, nativeQuery = true)
    List<Object[]> findMenuHierarchy();
    
    /**
     * 특정 역할의 메뉴 권한과 함께 조회
     */
    @Query("""
        SELECT m FROM Menu m 
        LEFT JOIN FETCH m.permissions p 
        WHERE m.isActive = true 
        AND m.isVisible = true 
        AND (p.roleName = :roleName OR p.roleName IS NULL)
        ORDER BY m.menuLevel ASC, m.sortOrder ASC
        """)
    List<Menu> findMenusWithPermissionsByRole(@Param("roleName") String roleName);
    
    /**
     * 사용자가 접근 가능한 메뉴 조회
     */
    @Query("""
        SELECT DISTINCT m FROM Menu m 
        JOIN m.permissions p 
        WHERE m.isActive = true 
        AND m.isVisible = true 
        AND p.roleName = :roleName 
        AND p.canRead = true
        ORDER BY m.menuLevel ASC, m.sortOrder ASC
        """)
    List<Menu> findAccessibleMenusByRole(@Param("roleName") String roleName);
    
    /**
     * 특정 부모 메뉴의 하위 메뉴 개수 조회
     */
    @Query("SELECT COUNT(m) FROM Menu m WHERE m.parent.id = :parentId AND m.isActive = true")
    long countActiveChildrenByParentId(@Param("parentId") Long parentId);
    
    /**
     * 메뉴 경로로 메뉴 조회 (URL 기반)
     */
    Optional<Menu> findByMenuUrlAndIsActiveTrue(String menuUrl);
    
    /**
     * 특정 메뉴의 모든 하위 메뉴 조회 (재귀)
     */
    @Query(value = """
        WITH RECURSIVE menu_children AS (
            SELECT id, menu_code, menu_name, parent_id, menu_level, sort_order
            FROM menus 
            WHERE id = :menuId AND is_active = true
            
            UNION ALL
            
            SELECT m.id, m.menu_code, m.menu_name, m.parent_id, m.menu_level, m.sort_order
            FROM menus m
            INNER JOIN menu_children mc ON m.parent_id = mc.id
            WHERE m.is_active = true
        )
        SELECT * FROM menu_children WHERE id != :menuId ORDER BY menu_level, sort_order
        """, nativeQuery = true)
    List<Object[]> findAllChildrenByMenuId(@Param("menuId") Long menuId);
    
    /**
     * 메뉴명으로 검색 (부분 일치)
     */
    @Query("""
        SELECT m FROM Menu m 
        WHERE m.isActive = true 
        AND (LOWER(m.menuName) LIKE LOWER(CONCAT('%', :keyword, '%')) 
             OR LOWER(m.menuNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY m.menuLevel ASC, m.sortOrder ASC
        """)
    List<Menu> searchMenusByKeyword(@Param("keyword") String keyword);
} 