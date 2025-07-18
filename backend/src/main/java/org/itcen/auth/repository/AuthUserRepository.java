package org.itcen.auth.repository;

import org.itcen.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 인증 관련 사용자 Repository 인터페이스
 * 
 * 단일 책임 원칙: 인증 관련 데이터 접근만 담당
 * 인터페이스 분리 원칙: 인증에 필요한 메서드만 정의
 * 의존성 역전 원칙: 구체적인 구현체가 아닌 인터페이스에 의존
 */
@Repository
public interface AuthUserRepository extends JpaRepository<User, String> {
    
    /**
     * 사용자명으로 사용자 조회 (로그인용)
     * 
     * @param username 사용자명
     * @return 사용자 정보
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 이메일로 사용자 조회 (로그인용)
     * 
     * @param email 이메일
     * @return 사용자 정보
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 사용자명 또는 이메일로 사용자 조회 (로그인용)
     * 
     * @param usernameOrEmail 사용자명 또는 이메일
     * @return 사용자 정보
     */
    @Query("SELECT u FROM User u WHERE u.username = :userid OR u.email = :userid")
    Optional<User> findByUsernameOrEmail(@Param("userid") String userid);
    
    /**
     * 사용자명 존재 여부 확인
     * 
     * @param username 사용자명
     * @return 존재 여부
     */
    boolean existsByUsername(String username);
    
    /**
     * 이메일 존재 여부 확인
     * 
     * @param email 이메일
     * @return 존재 여부
     */
    boolean existsByEmail(String email);
    
    /**
     * 휴대폰 번호 존재 여부 확인
     * 
     * @param mobile 휴대폰 번호
     * @return 존재 여부
     */
    boolean existsByMobile(String mobile);
    
    /**
     * 사용자 ID 존재 여부 확인
     * 
     * @param id 사용자 ID
     * @return 존재 여부
     */
    boolean existsById(String id);
    
    /**
     * 마지막 로그인 시간 업데이트
     * 
     * @param userId 사용자 ID
     * @param lastLoginTime 마지막 로그인 시간
     */
    @Modifying
    @Query("UPDATE User u SET u.updatedAt = :lastLoginTime WHERE u.id = :userId")
    void updateLastLoginTime(@Param("userId") String userId, @Param("lastLoginTime") LocalDateTime lastLoginTime);
    
    /**
     * 활성 사용자 수 조회 (최근 30일 내 로그인한 사용자)
     * 
     * @param since 기준 시간
     * @return 활성 사용자 수
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.updatedAt >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);
    
    /**
     * 사용자 비밀번호 업데이트
     * 
     * @param userId 사용자 ID
     * @param newPassword 새 비밀번호 (암호화된)
     */
    @Modifying
    @Query("UPDATE User u SET u.password = :newPassword, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :userId")
    void updatePassword(@Param("userId") String userId, @Param("newPassword") String newPassword);
} 