package org.itcen.domain.audit.repository;

import org.itcen.domain.audit.entity.AuditResultReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 점검결과보고 Repository
 * 
 * 단일 책임 원칙(SRP): 점검결과보고 데이터 접근만 담당
 */
@Repository
public interface AuditResultReportRepository extends JpaRepository<AuditResultReport, Long> {

    /**
     * 점검계획관리ID로 조회
     */
    Optional<AuditResultReport> findByAuditProgMngtId(Long auditProgMngtId);

    /**
     * 점검계획관리ID와 부서코드로 조회
     */
    Optional<AuditResultReport> findByAuditProgMngtIdAndDeptCd(Long auditProgMngtId, String deptCd);

    /**
     * 점검계획관리ID로 모든 부서 결과보고서 조회
     */
    List<AuditResultReport> findByAuditProgMngtIdOrderByDeptCd(Long auditProgMngtId);

    /**
     * 부서코드로 결과보고서 목록 조회 (최근순)
     */
    List<AuditResultReport> findByDeptCdOrderByCreatedAtDesc(String deptCd);

    /**
     * 점검결과보고서 상세 조회 (조인 정보 포함)
     */
    @Query(value = """
            SELECT 
                arr.audit_result_report_id as auditResultReportId,
                arr.audit_prog_mngt_id as auditProgMngtId,
                arr.dept_cd as deptCd,
                d.department_name as deptName,
                arr.emp_no as empNo,
                e1.emp_name as empName,
                arr.audit_result_content as auditResultContent,
                arr.emp_no_01 as empNo01,
                e2.emp_name as empName01,
                arr.audit_result_content_01 as auditResultContent01,
                arr.emp_no_02 as empNo02,
                e3.emp_name as empName02,
                arr.audit_result_content_02 as auditResultContent02,
                arr.req_memo as reqMemo,
                apm.audit_title as auditTitle,
                TO_CHAR(arr.created_at, 'YYYY-MM-DD HH24:MI:SS') as createdAt,
                TO_CHAR(arr.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updatedAt,
                arr.created_id as createdId,
                arr.updated_id as updatedId
            FROM audit_result_report arr
            LEFT JOIN departments d ON arr.dept_cd = d.department_id
            LEFT JOIN employee e1 ON arr.emp_no = e1.emp_no
            LEFT JOIN employee e2 ON arr.emp_no_01 = e2.emp_no
            LEFT JOIN employee e3 ON arr.emp_no_02 = e3.emp_no
            LEFT JOIN audit_prog_mngt apm ON arr.audit_prog_mngt_id = apm.audit_prog_mngt_id
            WHERE arr.audit_result_report_id = :auditResultReportId
            """, nativeQuery = true)
    List<Object[]> findAuditResultReportDetailNative(@Param("auditResultReportId") Long auditResultReportId);

    /**
     * 점검계획관리ID로 결과보고서 목록 조회 (조인 정보 포함)
     */
    @Query(value = """
            SELECT 
                arr.audit_result_report_id as auditResultReportId,
                arr.audit_prog_mngt_id as auditProgMngtId,
                arr.dept_cd as deptCd,
                d.department_name as deptName,
                arr.emp_no as empNo,
                e1.emp_name as empName,
                arr.audit_result_content as auditResultContent,
                arr.emp_no_01 as empNo01,
                e2.emp_name as empName01,
                arr.audit_result_content_01 as auditResultContent01,
                arr.emp_no_02 as empNo02,
                e3.emp_name as empName02,
                arr.audit_result_content_02 as auditResultContent02,
                arr.req_memo as reqMemo,
                apm.audit_title as auditTitle,
                TO_CHAR(arr.created_at, 'YYYY-MM-DD HH24:MI:SS') as createdAt,
                TO_CHAR(arr.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updatedAt,
                arr.created_id as createdId,
                arr.updated_id as updatedId
            FROM audit_result_report arr
            LEFT JOIN departments d ON arr.dept_cd = d.department_id
            LEFT JOIN employee e1 ON arr.emp_no = e1.emp_no
            LEFT JOIN employee e2 ON arr.emp_no_01 = e2.emp_no
            LEFT JOIN employee e3 ON arr.emp_no_02 = e3.emp_no
            LEFT JOIN audit_prog_mngt apm ON arr.audit_prog_mngt_id = apm.audit_prog_mngt_id
            WHERE arr.audit_prog_mngt_id = :auditProgMngtId
            ORDER BY arr.dept_cd
            """, nativeQuery = true)
    List<Object[]> findAuditResultReportsByAuditProgMngtIdNative(@Param("auditProgMngtId") Long auditProgMngtId);
}