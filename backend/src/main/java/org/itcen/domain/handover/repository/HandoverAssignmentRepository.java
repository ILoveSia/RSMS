package org.itcen.domain.handover.repository;

import org.itcen.domain.handover.entity.HandoverAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 인수인계 지정 Repository
 * 인수인계 지정 데이터 접근을 담당
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 */
@Repository
public interface HandoverAssignmentRepository extends JpaRepository<HandoverAssignment, Long> {

    /**
     * 직책 ID로 인수인계 지정 조회
     */
    List<HandoverAssignment> findByPositionId(Long positionId);

    /**
     * 인계자 사번으로 인수인계 지정 조회
     */
    List<HandoverAssignment> findByHandoverFromEmpNo(String handoverFromEmpNo);

    /**
     * 인수자 사번으로 인수인계 지정 조회
     */
    List<HandoverAssignment> findByHandoverToEmpNo(String handoverToEmpNo);

    /**
     * 상태별 인수인계 지정 조회
     */
    List<HandoverAssignment> findByStatus(HandoverAssignment.HandoverStatus status);

    /**
     * 인수인계 유형별 조회
     */
    List<HandoverAssignment> findByHandoverType(HandoverAssignment.HandoverType handoverType);

    /**
     * 진행중인 인수인계 조회
     */
    @Query("SELECT ha FROM HandoverAssignment ha WHERE ha.status IN ('PLANNED', 'IN_PROGRESS')")
    List<HandoverAssignment> findActiveHandovers();

    /**
     * 특정 기간 내 계획된 인수인계 조회
     */
    @Query("SELECT ha FROM HandoverAssignment ha WHERE ha.plannedStartDate BETWEEN :startDate AND :endDate")
    List<HandoverAssignment> findByPlannedDateRange(@Param("startDate") LocalDate startDate, 
                                                    @Param("endDate") LocalDate endDate);

    /**
     * 지연된 인수인계 조회 (예정일 지남)
     */
    @Query("SELECT ha FROM HandoverAssignment ha WHERE ha.status = 'IN_PROGRESS' AND ha.plannedEndDate < :currentDate")
    List<HandoverAssignment> findDelayedHandovers(@Param("currentDate") LocalDate currentDate);

    /**
     * 사용자별 인수인계 현황 조회 (인계자 또는 인수자)
     */
    @Query("SELECT ha FROM HandoverAssignment ha WHERE ha.handoverFromEmpNo = :empNo OR ha.handoverToEmpNo = :empNo")
    List<HandoverAssignment> findByEmployeeNo(@Param("empNo") String empNo);

    /**
     * 직책과 상태로 인수인계 지정 조회
     */
    Optional<HandoverAssignment> findByPositionIdAndStatus(Long positionId, HandoverAssignment.HandoverStatus status);

    /**
     * 복합 조건 검색
     */
    @Query("SELECT ha FROM HandoverAssignment ha WHERE " +
           "(:positionId IS NULL OR ha.positionId = :positionId) AND " +
           "(:handoverType IS NULL OR ha.handoverType = :handoverType) AND " +
           "(:status IS NULL OR ha.status = :status) AND " +
           "(:handoverFromEmpNo IS NULL OR ha.handoverFromEmpNo LIKE %:handoverFromEmpNo%) AND " +
           "(:handoverToEmpNo IS NULL OR ha.handoverToEmpNo LIKE %:handoverToEmpNo%)")
    Page<HandoverAssignment> findBySearchCriteria(@Param("positionId") Long positionId,
                                                  @Param("handoverType") HandoverAssignment.HandoverType handoverType,
                                                  @Param("status") HandoverAssignment.HandoverStatus status,
                                                  @Param("handoverFromEmpNo") String handoverFromEmpNo,
                                                  @Param("handoverToEmpNo") String handoverToEmpNo,
                                                  Pageable pageable);

    /**
     * 진행률별 통계 조회
     */
    @Query("SELECT ha.status, AVG(ha.progressRate), COUNT(ha) FROM HandoverAssignment ha GROUP BY ha.status")
    List<Object[]> getProgressStatistics();

    /**
     * 월별 인수인계 완료 통계
     */
    @Query("SELECT YEAR(ha.actualEndDate), MONTH(ha.actualEndDate), COUNT(ha) " +
           "FROM HandoverAssignment ha WHERE ha.status = 'COMPLETED' " +
           "GROUP BY YEAR(ha.actualEndDate), MONTH(ha.actualEndDate) " +
           "ORDER BY YEAR(ha.actualEndDate) DESC, MONTH(ha.actualEndDate) DESC")
    List<Object[]> getMonthlyCompletionStatistics();

    /**
     * 전체 인수인계 수 조회
     */
    @Query("SELECT COUNT(ha) FROM HandoverAssignment ha")
    long countAllHandovers();

    /**
     * 상태별 인수인계 수 조회
     */
    @Query("SELECT ha.status, COUNT(ha) FROM HandoverAssignment ha GROUP BY ha.status")
    List<Object[]> countByStatus();
}