package org.itcen.domain.employee.repository;

import org.itcen.domain.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 직원 Repository
 * 직원 정보 조회를 위한 데이터 접근 계층
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    /**
     * 사번으로 직원 조회
     */
    Optional<Employee> findByEmpNo(String empNo);

    /**
     * 사용 가능한 직원만 조회
     */
    List<Employee> findByUseYnOrderByEmpName(String useYn);

    /**
     * 성명으로 검색 (부분일치, 사용가능한 직원만)
     */
    @Query("SELECT e FROM Employee e WHERE e.useYn = 'Y' AND e.empName LIKE %:empName% ORDER BY e.empName")
    List<Employee> findByEmpNameContainingAndUseYn(@Param("empName") String empName);

    /**
     * 부서코드로 검색 (사용가능한 직원만)
     */
    List<Employee> findByDeptCodeAndUseYnOrderByEmpName(String deptCode, String useYn);

    /**
     * 성명과 부서코드로 검색 (사용가능한 직원만)
     */
    @Query("SELECT e FROM Employee e WHERE e.useYn = 'Y' " +
           "AND (:empName IS NULL OR :empName = '' OR e.empName LIKE %:empName%) " +
           "AND (:deptCode IS NULL OR :deptCode = '' OR e.deptCode = :deptCode) " +
           "ORDER BY e.empName")
    List<Employee> searchEmployees(@Param("empName") String empName, @Param("deptCode") String deptCode);

    /**
     * 휴대폰 번호로 직원 조회
     */
    Optional<Employee> findByPhoneNo(String phoneNo);

    /**
     * 성명으로 직원 조회 (정확히 일치)
     */
    Optional<Employee> findByEmpName(String empName);
}