package org.itcen.domain.approval.repository;

import java.util.List;
import java.util.Optional;
import org.itcen.domain.approval.entity.ApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 결재 단계 Repository
 * 
 * SOLID 원칙:
 * - 단일 책임: 결재 단계 데이터 접근만 담당
 * - 개방-폐쇄: 새로운 쿼리 메서드 추가 시 확장 가능
 * - 인터페이스 분리: 필요한 데이터 접근 기능만 정의
 * - 의존성 역전: JpaRepository 추상화에 의존
 */
@Repository
public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {

    /**
     * 결재별 단계 목록 조회 (순서대로)
     */
    List<ApprovalStep> findByApprovalIdOrderByStepOrder(Long approvalId);

    /**
     * 특정 결재의 특정 단계 조회
     */
    Optional<ApprovalStep> findByApprovalIdAndStepOrder(Long approvalId, Integer stepOrder);

    /**
     * 결재자별 단계 목록 조회
     */
    List<ApprovalStep> findByApproverId(String approverId);

    /**
     * 결재자 및 상태별 단계 목록 조회
     */
    List<ApprovalStep> findByApproverIdAndStepStatus(String approverId, String stepStatus);

    /**
     * 특정 결재자의 대기 중인 단계 목록
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "JOIN FETCH s.approval a " +
           "WHERE s.approverId = :approverId " +
           "AND s.stepStatus = 'PENDING' " +
           "ORDER BY a.requestDatetime ASC")
    List<ApprovalStep> findPendingStepsByApprover(@Param("approverId") String approverId);

    /**
     * 특정 결재자가 처리한 단계 목록
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "JOIN FETCH s.approval a " +
           "WHERE s.approverId = :approverId " +
           "AND s.stepStatus IN ('APPROVED', 'REJECTED') " +
           "ORDER BY s.approvedDatetime DESC")
    List<ApprovalStep> findProcessedStepsByApprover(@Param("approverId") String approverId);

    /**
     * 결재별 현재 진행 단계 조회
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "WHERE s.approvalId = :approvalId " +
           "AND s.stepStatus = 'PENDING' " +
           "ORDER BY s.stepOrder ASC")
    Optional<ApprovalStep> findCurrentStepByApprovalId(@Param("approvalId") Long approvalId);

    /**
     * 결재별 다음 대기 단계 조회
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "WHERE s.approvalId = :approvalId " +
           "AND s.stepStatus = 'WAITING' " +
           "AND s.stepOrder = (SELECT MIN(s2.stepOrder) FROM ApprovalStep s2 " +
           "                   WHERE s2.approvalId = :approvalId AND s2.stepStatus = 'WAITING')")
    Optional<ApprovalStep> findNextWaitingStepByApprovalId(@Param("approvalId") Long approvalId);

    /**
     * 특정 결재의 완료된 단계 수
     */
    @Query("SELECT COUNT(s) FROM ApprovalStep s " +
           "WHERE s.approvalId = :approvalId " +
           "AND s.stepStatus = 'APPROVED'")
    Long countApprovedStepsByApprovalId(@Param("approvalId") Long approvalId);

    /**
     * 특정 결재의 전체 단계 수
     */
    @Query("SELECT COUNT(s) FROM ApprovalStep s " +
           "WHERE s.approvalId = :approvalId")
    Long countTotalStepsByApprovalId(@Param("approvalId") Long approvalId);

    /**
     * 결재자별 처리 통계 (Native Query 사용)
     */
    @Query(value = "SELECT approver_id, step_status, COUNT(*) as count, " +
                   "AVG(EXTRACT(EPOCH FROM (approved_datetime - created_at))/3600) as avg_hours " +
                   "FROM approval_steps " +
                   "WHERE step_status IN ('APPROVED', 'REJECTED') " +
                   "AND approved_datetime IS NOT NULL " +
                   "GROUP BY approver_id, step_status", nativeQuery = true)
    List<Object[]> getApproverProcessingStatistics();

    /**
     * 단계별 평균 처리 시간 (Native Query 사용)
     */
    @Query(value = "SELECT step_order, " +
                   "AVG(EXTRACT(EPOCH FROM (approved_datetime - created_at))/3600) as avg_hours " +
                   "FROM approval_steps " +
                   "WHERE step_status = 'APPROVED' " +
                   "AND approved_datetime IS NOT NULL " +
                   "GROUP BY step_order " +
                   "ORDER BY step_order", nativeQuery = true)
    List<Object[]> getAverageProcessingTimeByStep();

    /**
     * 지연 처리 단계 목록 (생성일로부터 N일 이상 경과)
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "JOIN FETCH s.approval a " +
           "WHERE s.stepStatus = 'PENDING' " +
           "AND s.createdAt < :cutoffDate " +
           "ORDER BY s.createdAt ASC")
    List<ApprovalStep> findDelayedSteps(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);

    /**
     * 특정 업무 유형의 단계별 통계
     */
    @Query("SELECT s.stepOrder, s.stepStatus, COUNT(s) " +
           "FROM ApprovalStep s " +
           "JOIN s.approval a " +
           "WHERE a.taskTypeCd = :taskTypeCd " +
           "GROUP BY s.stepOrder, s.stepStatus " +
           "ORDER BY s.stepOrder, s.stepStatus")
    List<Object[]> getStepStatisticsByTaskType(@Param("taskTypeCd") String taskTypeCd);

    /**
     * 결재자가 특정 업무에 대해 처리해야 하는 단계 조회
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "JOIN s.approval a " +
           "WHERE s.approverId = :approverId " +
           "AND a.taskTypeCd = :taskTypeCd " +
           "AND a.taskId = :taskId " +
           "AND s.stepStatus = 'PENDING'")
    Optional<ApprovalStep> findPendingStepByApproverAndTask(
        @Param("approverId") String approverId,
        @Param("taskTypeCd") String taskTypeCd,
        @Param("taskId") Long taskId);

    // ====== 메인 대시보드용 쿼리 메서드들 ======
    
    /**
     * 사용자별 결재 대기 건수 조회
     */
    @Query("SELECT COUNT(s) FROM ApprovalStep s " +
           "JOIN s.approval a " +
           "WHERE s.approverId = :userId " +
           "AND s.stepStatus = 'PENDING'")
    Integer countPendingApprovalsByUserId(@Param("userId") String userId);

    /**
     * 사용자별 월별 결재 처리 트렌드 (최근 6개월)
     */
    @Query(value = "SELECT DATE_FORMAT(s.approved_datetime, '%Y-%m') as month, " +
                   "COUNT(CASE WHEN s.step_status = 'APPROVED' THEN 1 END) as completed, " +
                   "COUNT(CASE WHEN s.step_status = 'PENDING' THEN 1 END) as pending, " +
                   "COUNT(s.step_id) as total " +
                   "FROM approval_steps s " +
                   "JOIN approval a ON s.approval_id = a.approval_id " +
                   "WHERE s.approver_id = :userId " +
                   "AND s.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) " +
                   "GROUP BY DATE_FORMAT(s.approved_datetime, '%Y-%m') " +
                   "ORDER BY month DESC " +
                   "LIMIT 6", nativeQuery = true)
    List<Object[]> getMonthlyApprovalTrendsByUserId(@Param("userId") String userId);

    /**
     * 사용자별 최근 완료한 결재 목록 (최근 10건)
     */
    @Query("SELECT s FROM ApprovalStep s " +
           "JOIN FETCH s.approval a " +
           "WHERE s.approverId = :userId " +
           "AND s.stepStatus = 'APPROVED' " +
           "ORDER BY s.approvedDatetime DESC")
    List<ApprovalStep> getRecentApprovedTasksByUserId(@Param("userId") String userId);

    /**
     * 사용자별 현재 진행 중인 결재 프로세스 정보
     */
    @Query("SELECT a FROM Approval a " +
           "JOIN ApprovalStep s ON a.approvalId = s.approvalId " +
           "WHERE s.approverId = :userId " +
           "AND s.stepStatus = 'PENDING' " +
           "ORDER BY a.requestDatetime ASC")
    List<org.itcen.domain.approval.entity.Approval> getCurrentApprovalProcessesByUserId(@Param("userId") String userId);
}