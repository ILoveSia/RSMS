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
     * 제출 이력 조회 (positions 테이블과 조인)
     */
    @Query(value = """
        SELECT 
            s.submit_id as id,
            s.history_code as historyCode,
            s.executive_name as executiveName,
            s.position as position,
            s.submission_date as submissionDate,
            s.attachment_file as attachmentFile,
            s.remarks as remarks,
            s.positions_id as positionsId,
            p.positions_nm as positionsNm,
            p.ledger_order as ledgerOrder,
            p.confirm_gubun_cd as confirmGubunCd,
            p.write_dept_cd as writeDeptCd
        FROM rm_submit_mgmt s
        LEFT JOIN positions p ON s.positions_id = p.positions_id
        WHERE 1=1
            AND (:startDate IS NULL OR s.submission_date >= :startDate)
            AND (:endDate IS NULL OR s.submission_date <= :endDate)
            AND (:ledgerOrder IS NULL OR p.ledger_order = :ledgerOrder)
        ORDER BY s.submission_date DESC, s.submit_id DESC
        """, nativeQuery = true)
    List<Object[]> findSubmissionHistoryWithPositions(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("ledgerOrder") String ledgerOrder
    );
    
    /**
     * positions 테이블과 조인하여 제출 이력 조회 (JPQL)
     */
    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.positionEntity p " +
           "WHERE (:startDate IS NULL OR s.submissionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.submissionDate <= :endDate) " +
           "AND (:ledgerOrder IS NULL OR p.ledgerOrder = :ledgerOrder) " +
           "ORDER BY s.submissionDate DESC, s.id DESC")
    List<Submission> findSubmissionHistoryWithPositionsJPQL(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("ledgerOrder") String ledgerOrder
    );
}
