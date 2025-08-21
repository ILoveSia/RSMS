package org.itcen.domain.approval.repository;

import java.util.List;
import java.util.Optional;
import org.itcen.domain.approval.entity.Approval;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 결재 Repository
 * 
 * SOLID 원칙:
 * - 단일 책임: 결재 데이터 접근만 담당
 * - 개방-폐쇄: 새로운 쿼리 메서드 추가 시 확장 가능
 * - 인터페이스 분리: 필요한 데이터 접근 기능만 정의
 * - 의존성 역전: JpaRepository 추상화에 의존
 */
@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    /**
     * 업무별 결재 정보 조회
     */
    Optional<Approval> findByTaskTypeCdAndTaskId(String taskTypeCd, Long taskId);

    /**
     * 요청자별 결재 목록 조회
     */
    List<Approval> findByRequesterId(String requesterId);

    /**
     * 업무 유형별 결재 목록 조회
     */
    List<Approval> findByTaskTypeCd(String taskTypeCd);

    /**
     * 상태별 결재 목록 조회
     */
    List<Approval> findByApprStatCd(String apprStatCd);

    /**
     * 요청자 및 상태별 결재 목록 조회
     */
    List<Approval> findByRequesterIdAndApprStatCd(String requesterId, String apprStatCd);

    /**
     * 특정 사용자가 결재자인 결재 목록 조회 (단계별 조인)
     */
    @Query("SELECT DISTINCT a FROM Approval a " +
           "JOIN FETCH a.steps s " +
           "WHERE s.approverId = :approverId " +
           "AND s.stepStatus = :stepStatus " +
           "ORDER BY a.requestDatetime DESC")
    List<Approval> findApprovalsByApproverAndStatus(
        @Param("approverId") String approverId, 
        @Param("stepStatus") String stepStatus);

    /**
     * 특정 사용자의 결재 대기 목록 조회
     */
    @Query("SELECT DISTINCT a FROM Approval a " +
           "JOIN FETCH a.steps s " +
           "WHERE s.approverId = :approverId " +
           "AND s.stepStatus = 'PENDING' " +
           "ORDER BY a.requestDatetime ASC")
    List<Approval> findPendingApprovalsByApprover(@Param("approverId") String approverId);

    /**
     * 특정 사용자가 처리한 결재 목록 조회
     */
    @Query("SELECT DISTINCT a FROM Approval a " +
           "JOIN FETCH a.steps s " +
           "WHERE s.approverId = :approverId " +
           "AND s.stepStatus IN ('APPROVED', 'REJECTED') " +
           "ORDER BY s.approvedDatetime DESC")
    List<Approval> findProcessedApprovalsByApprover(@Param("approverId") String approverId);

    /**
     * 결재 상세 정보 조회 (단계 정보 포함)
     */
    @Query("SELECT a FROM Approval a " +
           "JOIN FETCH a.steps s " +
           "WHERE a.approvalId = :approvalId " +
           "ORDER BY s.stepOrder ASC")
    Optional<Approval> findByIdWithSteps(@Param("approvalId") Long approvalId);

    /**
     * 업무별 결재 상세 정보 조회 (단계 정보 포함)
     */
    @Query("SELECT a FROM Approval a " +
           "JOIN FETCH a.steps s " +
           "WHERE a.taskTypeCd = :taskTypeCd " +
           "AND a.taskId = :taskId " +
           "ORDER BY s.stepOrder ASC")
    Optional<Approval> findByTaskWithSteps(
        @Param("taskTypeCd") String taskTypeCd, 
        @Param("taskId") Long taskId);

    /**
     * 전체 결재 현황 조회 (페이징)
     */
    @Query("SELECT a FROM Approval a " +
           "LEFT JOIN FETCH a.steps " +
           "ORDER BY a.requestDatetime DESC")
    List<Approval> findAllWithSteps();

    /**
     * 결재 통계 - 상태별 개수
     */
    @Query("SELECT a.apprStatCd, COUNT(a) FROM Approval a " +
           "GROUP BY a.apprStatCd")
    List<Object[]> getApprovalStatusStatistics();

    /**
     * 결재 통계 - 결재자별 처리 현황
     */
    @Query("SELECT s.approverId, s.stepStatus, COUNT(s) FROM Approval a " +
           "JOIN a.steps s " +
           "GROUP BY s.approverId, s.stepStatus")
    List<Object[]> getApproverStatistics();

    /**
     * 지연 결재 목록 (요청일로부터 N일 이상 경과)
     */
    @Query("SELECT DISTINCT a FROM Approval a " +
           "JOIN a.steps s " +
           "WHERE s.stepStatus = 'PENDING' " +
           "AND a.requestDatetime < :cutoffDate " +
           "ORDER BY a.requestDatetime ASC")
    List<Approval> findDelayedApprovals(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    /**
     * 업무 유형별 평균 처리 시간 (Native Query 사용)
     */
    @Query(value = "SELECT task_type_cd, " +
                   "AVG(EXTRACT(EPOCH FROM (approval_datetime - request_datetime))/3600) as avg_hours " +
                   "FROM approval " +
                   "WHERE appr_stat_cd = 'APPROVED' " +
                   "AND approval_datetime IS NOT NULL " +
                   "GROUP BY task_type_cd", nativeQuery = true)
    List<Object[]> getAverageProcessingTimeByTaskType();

    /**
     * 긴급도별 결재 목록 조회
     */
    @Query("SELECT a FROM Approval a " +
           "LEFT JOIN FETCH a.steps " +
           "WHERE a.urgencyCd = :urgencyCd " +
           "ORDER BY a.requestDatetime DESC")
    List<Approval> findByUrgencyCdWithSteps(@Param("urgencyCd") String urgencyCd);

    /**
     * 요청자별 결재 목록 조회 (페이징 지원, 최신순)
     */
    @Query("SELECT a FROM Approval a " +
           "WHERE a.requesterId = :requesterId " +
           "ORDER BY a.requestDatetime DESC")
    List<Approval> findByRequesterIdOrderByRequestDatetimeDesc(@Param("requesterId") String requesterId, Pageable pageable);
}