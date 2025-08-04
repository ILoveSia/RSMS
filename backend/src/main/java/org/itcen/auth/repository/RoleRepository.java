package org.itcen.auth.repository;

import org.itcen.auth.domain.permission.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 역할 Repository
 * 
 * SOLID 원칙:
 * - Single Responsibility: 역할 데이터 접근만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Liskov Substitution: JpaRepository 인터페이스 준수
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    /**
     * 활성 상태인 모든 역할 조회
     */
    @Query("SELECT r FROM PermissionRole r WHERE r.useYn = 'Y' ORDER BY r.roleId")
    List<Role> findAllActive();

    /**
     * 역할 ID로 활성 역할 조회
     */
    @Query("SELECT r FROM PermissionRole r WHERE r.roleId = :roleId AND r.useYn = 'Y'")
    Optional<Role> findActiveByRoleId(String roleId);

    /**
     * 역할명으로 역할 조회
     */
    @Query("SELECT r FROM PermissionRole r WHERE r.roleName = :roleName")
    Optional<Role> findByRoleName(String roleName);

    /**
     * 역할 존재 여부 확인
     */
    boolean existsByRoleId(String roleId);

    /**
     * 활성 역할 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM PermissionRole r " +
           "WHERE r.roleId = :roleId AND r.useYn = 'Y'")
    boolean existsActiveRole(String roleId);
}