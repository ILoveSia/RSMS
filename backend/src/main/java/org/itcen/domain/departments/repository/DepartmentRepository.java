package org.itcen.domain.departments.repository;

import java.util.List;
import java.util.Optional;
import org.itcen.domain.departments.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 부서 Repository
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {

    /**
     * 부서명으로 조회
     */
    Optional<Department> findByDepartmentName(String departmentName);

    /**
     * 사용 여부로 조회
     */
    List<Department> findByUseYnOrderByDepartmentName(String useYn);

    /**
     * 활성 부서 목록 조회
     */
    default List<Department> findActiveDepartments() {
        return findByUseYnOrderByDepartmentName("Y");
    }

    /**
     * 키워드로 부서 검색 (페이징)
     */
    @Query("SELECT d FROM Department d WHERE " + "(:keyword IS NULL OR "
            + "d.departmentId LIKE %:keyword% OR " + "d.departmentName LIKE %:keyword%) AND "
            + "(:useYn IS NULL OR d.useYn = :useYn) " + "ORDER BY d.departmentName")
    Page<Department> searchDepartments(@Param("keyword") String keyword,
            @Param("useYn") String useYn, Pageable pageable);

    /**
     * 키워드로 부서 검색 (목록)
     */
    @Query("SELECT d FROM Department d WHERE " + "(:keyword IS NULL OR "
            + "d.departmentId LIKE %:keyword% OR " + "d.departmentName LIKE %:keyword%) AND "
            + "(:useYn IS NULL OR d.useYn = :useYn) " + "ORDER BY d.departmentName")
    List<Department> searchDepartmentsList(@Param("keyword") String keyword,
            @Param("useYn") String useYn);

    /**
     * 부서 ID 존재 여부 확인
     */
    boolean existsByDepartmentId(String departmentId);

    /**
     * 부서명 존재 여부 확인 (본인 제외)
     */
    @Query("SELECT COUNT(d) > 0 FROM Department d WHERE "
            + "d.departmentName = :departmentName AND " + "d.departmentId != :excludeId")
    boolean existsByDepartmentNameAndDepartmentIdNot(@Param("departmentName") String departmentName,
            @Param("excludeId") String excludeId);
}
