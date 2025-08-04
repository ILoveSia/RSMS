package org.itcen.auth.repository;

import org.itcen.auth.domain.permission.UserRole;
import org.itcen.auth.domain.permission.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 사용자-역할 매핑 Repository
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자-역할 매핑 데이터 접근만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Liskov Substitution: JpaRepository 인터페이스 준수
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    /**
     * 사용자 ID로 활성 상태인 역할 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId AND ur.useYn = 'Y'")
    List<UserRole> findActiveRolesByUserId(@Param("userId") String userId);

    /**
     * 역할 ID로 활성 상태인 사용자 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.roleId = :roleId AND ur.useYn = 'Y'")
    List<UserRole> findActiveUsersByRoleId(@Param("roleId") String roleId);

    /**
     * 사용자 ID와 역할 ID로 매핑 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId AND ur.roleId = :roleId")
    UserRole findByUserIdAndRoleId(@Param("userId") String userId, @Param("roleId") String roleId);

    /**
     * 모든 활성 상태인 사용자-역할 매핑 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.useYn = 'Y' ORDER BY ur.userId, ur.roleId")
    List<UserRole> findAllActive();

    /**
     * 특정 사용자의 특정 역할 활성 상태 확인
     */
    @Query("SELECT CASE WHEN COUNT(ur) > 0 THEN true ELSE false END FROM UserRole ur " +
           "WHERE ur.userId = :userId AND ur.roleId = :roleId AND ur.useYn = 'Y'")
    boolean existsActiveUserRole(@Param("userId") String userId, @Param("roleId") String roleId);

    /**
     * 사용자 ID로 모든 매핑 삭제 (사용자 삭제 시)
     */
    void deleteByUserId(String userId);

    /**
     * 역할 ID로 모든 매핑 삭제 (역할 삭제 시)
     */
    void deleteByRoleId(String roleId);

    /**
     * 사용자별 역할 개수 조회
     */
    @Query("SELECT ur.userId, COUNT(ur) FROM UserRole ur WHERE ur.useYn = 'Y' GROUP BY ur.userId")
    List<Object[]> countRolesByUser();

    /**
     * 역할별 사용자 개수 조회
     */
    @Query("SELECT ur.roleId, COUNT(ur) FROM UserRole ur WHERE ur.useYn = 'Y' GROUP BY ur.roleId")
    List<Object[]> countUsersByRole();
}