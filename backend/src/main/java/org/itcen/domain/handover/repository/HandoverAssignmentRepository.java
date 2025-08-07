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


/**
 * 인수인계 지정 레포지토리
 */
@Repository
public interface HandoverAssignmentRepository extends JpaRepository<HandoverAssignment, Long> {

    /**
     * 상태별 조회
     */
    Page<HandoverAssignment> findByStatus(HandoverAssignment.HandoverStatus status, Pageable pageable);

    /**
     * 인수인계 유형별 조회
     */
    Page<HandoverAssignment> findByHandoverType(HandoverAssignment.HandoverType handoverType, Pageable pageable);

    /**
     * 상태와 유형으로 조회
     */
    Page<HandoverAssignment> findByStatusAndHandoverType(HandoverAssignment.HandoverStatus status, HandoverAssignment.HandoverType handoverType, Pageable pageable);

    /**
     * 인계자 사번으로 조회
     */
    List<HandoverAssignment> findByHandoverFromEmpNo(String empNo);

    /**
     * 인수자 사번으로 조회
     */
    List<HandoverAssignment> findByHandoverToEmpNo(String empNo);

    /**
     * 기간별 조회
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE " +
           "(:startDate IS NULL OR h.plannedStartDate >= :startDate) AND " +
           "(:endDate IS NULL OR h.plannedEndDate <= :endDate)")
    Page<HandoverAssignment> findByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    /**
     * 복합 조건 검색
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE " +
           "(:status IS NULL OR h.status = :status) AND " +
           "(:handoverType IS NULL OR h.handoverType = :handoverType) AND " +
           "(:fromEmpNo IS NULL OR h.handoverFromEmpNo LIKE %:fromEmpNo%) AND " +
           "(:toEmpNo IS NULL OR h.handoverToEmpNo LIKE %:toEmpNo%) AND " +
           "(:startDate IS NULL OR h.plannedStartDate >= :startDate) AND " +
           "(:endDate IS NULL OR h.plannedEndDate <= :endDate)")
    Page<HandoverAssignment> findBySearchConditions(
            @Param("status") HandoverAssignment.HandoverStatus status,
            @Param("handoverType") HandoverAssignment.HandoverType handoverType,
            @Param("fromEmpNo") String fromEmpNo,
            @Param("toEmpNo") String toEmpNo,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    /**
     * 진행 중인 인수인계 건수 조회
     */
    @Query("SELECT COUNT(h) FROM HandoverAssignment h WHERE h.status = org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.IN_PROGRESS")
    long countInProgress();

    /**
     * 완료된 인수인계 건수 조회
     */
    @Query("SELECT COUNT(h) FROM HandoverAssignment h WHERE h.status = org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.COMPLETED")
    long countCompleted();

    /**
     * 지연된 인수인계 조회 (예정 완료일이 지났는데 완료되지 않은 건)
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE " +
           "h.status IN (org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.PLANNED, org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.IN_PROGRESS) AND " +
           "h.plannedEndDate < CURRENT_DATE")
    List<HandoverAssignment> findDelayedAssignments();

    /**
     * 상태별 건수 조회
     */
    long countByStatus(HandoverAssignment.HandoverStatus status);

    /**
     * 상태별 조회 (Pageable 없는 버전)
     */
    List<HandoverAssignment> findByStatus(HandoverAssignment.HandoverStatus status);

    /**
     * 직책 ID와 상태로 조회
     */

    /**
     * 직책 ID로 조회
     */

    /**
     * 사원번호로 조회 (인계자 또는 인수자)
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE h.handoverFromEmpNo = :empNo OR h.handoverToEmpNo = :empNo")
    List<HandoverAssignment> findByEmployeeNo(@Param("empNo") String empNo);

    /**
     * 활성 인수인계 조회 (진행중인 것들)
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE h.status = org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.IN_PROGRESS")
    List<HandoverAssignment> findActiveHandovers();

    /**
     * 지연된 인수인계 조회 (날짜 파라미터 포함)
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE " +
           "h.status IN (org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.PLANNED, org.itcen.domain.handover.entity.HandoverAssignment$HandoverStatus.IN_PROGRESS) AND " +
           "h.plannedEndDate < :currentDate")
    List<HandoverAssignment> findDelayedHandovers(@Param("currentDate") LocalDate currentDate);

    /**
     * 검색 조건으로 조회
     */
    @Query("SELECT h FROM HandoverAssignment h WHERE " +
           "(:handoverType IS NULL OR h.handoverType = :handoverType) AND " +
           "(:status IS NULL OR h.status = :status) AND " +
           "(:fromEmpNo IS NULL OR h.handoverFromEmpNo LIKE %:fromEmpNo%) AND " +
           "(:toEmpNo IS NULL OR h.handoverToEmpNo LIKE %:toEmpNo%)")
    Page<HandoverAssignment> findBySearchCriteria(
            @Param("handoverType") HandoverAssignment.HandoverType handoverType,
            @Param("status") HandoverAssignment.HandoverStatus status,
            @Param("fromEmpNo") String fromEmpNo,
            @Param("toEmpNo") String toEmpNo,
            Pageable pageable);

    /**
     * 같은 인계자-인수자 관계가 존재하는지 확인 (생성 시 중복 검증용)
     */
    @Query("SELECT COUNT(h) > 0 FROM HandoverAssignment h WHERE " +
           "h.handoverFromEmpNo = :fromEmpNo AND h.handoverToEmpNo = :toEmpNo")
    boolean existsByHandoverFromEmpNoAndHandoverToEmpNo(
            @Param("fromEmpNo") String fromEmpNo,
            @Param("toEmpNo") String toEmpNo);

    /**
     * 자기 자신을 제외하고 같은 인계자-인수자 관계가 존재하는지 확인 (수정 시 중복 검증용)
     */
    @Query("SELECT COUNT(h) > 0 FROM HandoverAssignment h WHERE " +
           "h.assignmentId != :assignmentId AND " +
           "h.handoverFromEmpNo = :fromEmpNo AND h.handoverToEmpNo = :toEmpNo")
    boolean existsByHandoverFromEmpNoAndHandoverToEmpNoExcludingId(
            @Param("assignmentId") Long assignmentId,
            @Param("fromEmpNo") String fromEmpNo,
            @Param("toEmpNo") String toEmpNo);
}