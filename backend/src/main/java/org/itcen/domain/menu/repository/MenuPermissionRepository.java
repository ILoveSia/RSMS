package org.itcen.domain.menu.repository;

import org.itcen.domain.menu.entity.MenuPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 메뉴 권한 Repository
 * 
 * SOLID 원칙:
 * - Single Responsibility: 메뉴 권한 데이터 접근만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Liskov Substitution: JpaRepository 인터페이스 준수
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
@Repository
public interface MenuPermissionRepository extends JpaRepository<MenuPermission, Long> {

    /**
     * 메뉴 ID와 역할명으로 권한 조회
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.menu.id = :menuId AND mp.roleName = :roleName")
    Optional<MenuPermission> findByMenuIdAndRoleName(@Param("menuId") Long menuId, @Param("roleName") String roleName);

    /**
     * 메뉴 ID로 모든 권한 조회
     */
    @Query("SELECT mp FROM MenuPermission mp JOIN FETCH mp.menu WHERE mp.menu.id = :menuId ORDER BY mp.roleName")
    List<MenuPermission> findByMenuId(@Param("menuId") Long menuId);

    /**
     * 역할명으로 모든 권한 조회
     */
    @Query("SELECT mp FROM MenuPermission mp JOIN FETCH mp.menu WHERE mp.roleName = :roleName ORDER BY mp.menu.sortOrder")
    List<MenuPermission> findByRoleName(@Param("roleName") String roleName);

    /**
     * 특정 역할이 접근 가능한 메뉴 조회 (읽기 권한 이상)
     */
    @Query("SELECT mp FROM MenuPermission mp JOIN FETCH mp.menu " +
           "WHERE mp.roleName = :roleName AND mp.canRead = true " +
           "ORDER BY mp.menu.sortOrder")
    List<MenuPermission> findAccessibleMenusByRole(@Param("roleName") String roleName);

    /**
     * 특정 메뉴에 특정 권한을 가진 역할 조회
     */
    @Query("SELECT mp.roleName FROM MenuPermission mp WHERE mp.menu.id = :menuId " +
           "AND ((:permissionType = 'READ' AND mp.canRead = true) OR " +
           "     (:permissionType = 'WRITE' AND mp.canWrite = true) OR " +
           "     (:permissionType = 'DELETE' AND mp.canDelete = true))")
    List<String> findRolesWithPermission(@Param("menuId") Long menuId, @Param("permissionType") String permissionType);

    /**
     * 모든 메뉴 권한 매트릭스 조회 (관리 화면용)
     */
    @Query("SELECT mp FROM MenuPermission mp " +
           "JOIN FETCH mp.menu m " +
           "ORDER BY m.sortOrder, mp.roleName")
    List<MenuPermission> findAllWithMenu();

    /**
     * 특정 메뉴의 권한이 있는지 확인
     */
    @Query("SELECT CASE WHEN COUNT(mp) > 0 THEN true ELSE false END FROM MenuPermission mp " +
           "WHERE mp.menu.id = :menuId AND mp.roleName = :roleName " +
           "AND ((:permissionType = 'READ' AND mp.canRead = true) OR " +
           "     (:permissionType = 'write' AND mp.canWrite = true) OR " +
           "     (:permissionType = 'delete' AND mp.canDelete = true))")
    boolean hasPermission(@Param("menuId") Long menuId, @Param("roleName") String roleName, @Param("permissionType") String permissionType);

    /**
     * 메뉴별 권한 통계 조회
     */
    @Query("SELECT mp.menu.id, mp.menu.menuName, " +
           "SUM(CASE WHEN mp.canRead = true THEN 1 ELSE 0 END) as readCount, " +
           "SUM(CASE WHEN mp.canWrite = true THEN 1 ELSE 0 END) as writeCount, " +
           "SUM(CASE WHEN mp.canDelete = true THEN 1 ELSE 0 END) as deleteCount " +
           "FROM MenuPermission mp GROUP BY mp.menu.id, mp.menu.menuName " +
           "ORDER BY mp.menu.sortOrder")
    List<Object[]> getMenuPermissionStatistics();

    /**
     * 역할별 권한 통계 조회
     */
    @Query("SELECT mp.roleName, " +
           "SUM(CASE WHEN mp.canRead = true THEN 1 ELSE 0 END) as readCount, " +
           "SUM(CASE WHEN mp.canWrite = true THEN 1 ELSE 0 END) as writeCount, " +
           "SUM(CASE WHEN mp.canDelete = true THEN 1 ELSE 0 END) as deleteCount " +
           "FROM MenuPermission mp GROUP BY mp.roleName " +
           "ORDER BY mp.roleName")
    List<Object[]> getRolePermissionStatistics();

    /**
     * 메뉴 ID로 권한 삭제 (메뉴 삭제 시)
     */
    void deleteByMenuId(Long menuId);

    /**
     * 역할명으로 권한 삭제 (역할 삭제 시)
     */
    void deleteByRoleName(String roleName);

    /**
     * 메뉴 ID와 다중 역할명으로 권한 조회 (사용자별 메뉴 권한 조회용)
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.menu.id = :menuId AND mp.roleName IN :roleNames")
    List<MenuPermission> findByMenuIdAndRoleNameIn(@Param("menuId") Long menuId, @Param("roleNames") java.util.Set<String> roleNames);
}