package org.itcen.domain.user.repository;

import org.itcen.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 Repository
 * 사용자 데이터 접근을 담당
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * 사용자명으로 사용자 조회
     */
    Optional<User> findByUsername(String username);

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 사용자명 존재 여부 확인
     */
    boolean existsByUsername(String username);

    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);

    /**
     * 휴대폰 번호로 사용자 조회
     */
    Optional<User> findByMobile(String mobile);

    /**
     * 휴대폰 번호 존재 여부 확인
     */
    boolean existsByMobile(String mobile);

    /**
     * 사번으로 사용자 조회
     */
    Optional<User> findByNum(String num);

    /**
     * 사번 존재 여부 확인
     */
    boolean existsByNum(String num);

    /**
     * 사용자명, 이메일, 주소, 휴대폰, 부서코드, 사번, 직급코드, 직책코드로 검색
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:username IS NULL OR u.username LIKE %:username%) AND " +
           "(:email IS NULL OR u.email LIKE %:email%) AND " +
           "(:address IS NULL OR u.address LIKE %:address%) AND " +
           "(:mobile IS NULL OR u.mobile LIKE %:mobile%) AND " +
           "(:deptCd IS NULL OR u.deptCd LIKE %:deptCd%) AND " +
           "(:num IS NULL OR u.num LIKE %:num%) AND " +
           "(:jobRankCd IS NULL OR u.jobRankCd LIKE %:jobRankCd%) AND " +
           "(:jobTitleCd IS NULL OR u.jobTitleCd LIKE %:jobTitleCd%)")
    Page<User> findBySearchCriteria(
            @Param("username") String username,
            @Param("email") String email,
            @Param("address") String address,
            @Param("mobile") String mobile,
            @Param("deptCd") String deptCd,
            @Param("num") String num,
            @Param("jobRankCd") String jobRankCd,
            @Param("jobTitleCd") String jobTitleCd,
            Pageable pageable
    );

    /**
     * 사원 목록 조회 (팝업용)
     * 페이징 없이 검색 조건에 맞는 사원 목록을 반환
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:username IS NULL OR u.username LIKE %:username%) AND " +
           "(:num IS NULL OR u.num LIKE %:num%) AND " +
           "(:deptCd IS NULL OR u.deptCd LIKE %:deptCd%) AND " +
           "(:jobRankCd IS NULL OR u.jobRankCd LIKE %:jobRankCd%) " +
           "ORDER BY u.num ASC")
    List<User> findEmployeesBySearchCriteria(
            @Param("username") String username,
            @Param("num") String num,
            @Param("deptCd") String deptCd,
            @Param("jobRankCd") String jobRankCd
    );

    /**
     * 전체 사용자 수 조회
     */
    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();
} 