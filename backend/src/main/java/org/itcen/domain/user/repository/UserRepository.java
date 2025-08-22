package org.itcen.domain.user.repository;

import org.itcen.domain.departments.entity.Department;
import org.itcen.domain.employee.entity.Employee;
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
     * 사번으로 사용자 조회 (Employee JOIN)
     */
    @Query("SELECT u FROM User u LEFT JOIN Employee e ON u.empNo = e.empNo WHERE e.empName = :empName")
    Optional<User> findByEmployeeName(@Param("empName") String empName);

    /**
     * Employee 이름으로 사용자 존재 여부 확인
     */
    @Query("SELECT COUNT(u) > 0 FROM User u LEFT JOIN Employee e ON u.empNo = e.empNo WHERE e.empName = :empName")
    boolean existsByEmployeeName(@Param("empName") String empName);

    /**
     * 사번으로 사용자 조회
     */
    Optional<User> findByEmpNo(String empNo);

    /**
     * 사번 존재 여부 확인
     */
    boolean existsByEmpNo(String empNo);

    /**
     * Employee 테이블과 조인하여 검색 (부서명, 직급명 포함)
     */
    @Query("SELECT u, e FROM User u " +
           "LEFT JOIN Employee e ON u.empNo = e.empNo " +
           "WHERE (:empName IS NULL OR e.empName LIKE %:empName%) AND " +
           "(:empNo IS NULL OR u.empNo LIKE %:empNo%) AND " +
           "(:departmentName IS NULL OR e.deptName LIKE %:departmentName%) AND " +
           "(:positionName IS NULL OR e.positionName LIKE %:positionName%)")
    Page<Object[]> findBySearchCriteria(
            @Param("empName") String empName,
            @Param("empNo") String empNo,
            @Param("departmentName") String departmentName,
            @Param("positionName") String positionName,
            Pageable pageable
    );



    /**
     * 전체 사용자 수 조회
     */
    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

    /**
     * 사용자 목록을 employee와 조인하여 조회
     * 부서명, 직급명 정보를 포함하여 반환
     */
    @Query("SELECT u, e FROM User u " +
           "LEFT JOIN Employee e ON u.empNo = e.empNo " +
           "ORDER BY u.empNo")
    List<Object[]> findUsersWithEmployee();
} 