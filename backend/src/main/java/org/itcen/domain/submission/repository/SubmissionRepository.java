package org.itcen.domain.submission.repository;

import org.itcen.domain.submission.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /**
     * 모든 제출 이력 조회 (필터링 없음) - 네이티브 쿼리
     */
    @Query(value = """
            SELECT
                s.rm_submit_mgmt_id as id,
                s.submit_hist_cd as historyCode,
                s.execofficer_id as execofficerId,
                u.emp_name as executiveName,
                p.positions_nm as position,
                s.rm_submit_dt as submissionDate,
                COALESCE(a.original_name, '') as attachmentFile,
                s.rm_submit_remarks as remarks,
                s.positions_id as positionsId,
                p.positions_nm as positionsNm,
                p.ledger_order as ledgerOrder,
                p.confirm_gubun_cd as confirmGubunCd,
                p.write_dept_cd as writeDeptCd,
                s.bank_cd as bankCd,
                CASE WHEN a.attach_id IS NOT NULL THEN true ELSE false END as hasAttachment,
                COUNT(a.attach_id) as attachmentCount
            FROM rm_submit_mgmt s
            LEFT JOIN positions p ON s.positions_id = p.positions_id
            LEFT JOIN execofficer e ON e.execofficer_id::varchar = s.execofficer_id
            LEFT JOIN employee u ON e.emp_id = u.emp_no
            LEFT JOIN attachments a ON a.entity_type = 'rm_submit_mgmt'
                AND a.entity_id = s.rm_submit_mgmt_id
                AND (a.deleted_yn = 'N' OR a.deleted_yn IS NULL)
            GROUP BY s.rm_submit_mgmt_id, s.submit_hist_cd, s.execofficer_id, u.emp_name,
                     p.positions_nm, s.rm_submit_dt, s.rm_submit_remarks, s.positions_id,
                     p.ledger_order, p.confirm_gubun_cd, p.write_dept_cd, s.bank_cd, a.original_name, a.attach_id
            ORDER BY s.rm_submit_dt DESC, s.rm_submit_mgmt_id DESC
            """, nativeQuery = true)
    List<Object[]> findAllSubmissionHistoryWithPositions();

    // 임시로 주석 처리 - PostgreSQL 파라미터 타입 에러 때문에
    /*
     * @Query(value = """
     * SELECT
     * s.rm_submit_mgmt_id as id,
     * s.submit_hist_cd as historyCode,
     * COALESCE(u.username, s.execofficer_id) as executiveName,
     * p.positions_nm as position,
     * s.rm_submit_dt as submissionDate,
     * '' as attachmentFile,
     * s.rm_submit_remarks as remarks,
     * s.positions_id as positionsId,
     * p.positions_nm as positionsNm,
     * p.ledger_order as ledgerOrder,
     * p.confirm_gubun_cd as confirmGubunCd,
     * p.write_dept_cd as writeDeptCd
     * FROM rm_submit_mgmt s
     * LEFT JOIN positions p ON s.positions_id = p.positions_id
     * LEFT JOIN users u ON s.execofficer_id = u.id
     * WHERE (?1 IS NULL OR s.rm_submit_dt >= CAST(?1 AS DATE))
     * AND (?2 IS NULL OR s.rm_submit_dt <= CAST(?2 AS DATE))
     * AND (?3 IS NULL OR ?3 = '' OR p.ledger_order = ?3)
     * ORDER BY s.rm_submit_dt DESC, s.rm_submit_mgmt_id DESC
     * """, nativeQuery = true)
     * List<Object[]> findSubmissionHistoryWithPositions(
     * 
     * @Param("startDate") LocalDate startDate,
     * 
     * @Param("endDate") LocalDate endDate,
     * 
     * @Param("ledgerOrder") String ledgerOrder
     * );
     */

    /**
     * positions 테이블과 조인하여 제출 이력 조회 (JPQL)
     */
    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.positionEntity p " +
            "WHERE (:startDate IS NULL OR s.rmSubmitDt >= :startDate) " +
            "AND (:endDate IS NULL OR s.rmSubmitDt <= :endDate) " +
            "AND (:ledgerOrder IS NULL OR p.ledgerOrder = :ledgerOrder) " +
            "ORDER BY s.rmSubmitDt DESC, s.id DESC")
    List<Submission> findSubmissionHistoryWithPositionsJPQL(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("ledgerOrder") String ledgerOrder);

    /**
     * submit_hist_cd로 존재 여부 확인
     */
    boolean existsBySubmitHistCd(String submitHistCd);
}
