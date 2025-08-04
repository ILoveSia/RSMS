package org.itcen.domain.handover.repository;

import org.itcen.domain.handover.entity.HandoverHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 인수인계 이력 Repository
 * 인수인계 이력 데이터 접근을 담당
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 이력 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 */
@Repository
public interface HandoverHistoryRepository extends JpaRepository<HandoverHistory, Long> {

    /**
     * 인수인계 지정 ID로 이력 조회
     */
    List<HandoverHistory> findByAssignmentIdOrderByActivityDateDesc(Long assignmentId);

    /**
     * 활동 유형별 이력 조회
     */
    List<HandoverHistory> findByActivityType(HandoverHistory.ActivityType activityType);

    /**
     * 작업자별 이력 조회
     */
    List<HandoverHistory> findByActorEmpNo(String actorEmpNo);

    /**
     * 연관 엔티티 타입별 이력 조회
     */
    List<HandoverHistory> findByRelatedEntityType(HandoverHistory.RelatedEntityType relatedEntityType);

    /**
     * 연관 엔티티 타입과 ID로 이력 조회
     */
    List<HandoverHistory> findByRelatedEntityTypeAndRelatedEntityId(HandoverHistory.RelatedEntityType relatedEntityType,
                                                                    Long relatedEntityId);

    /**
     * 특정 기간 내 활동 이력 조회
     */
    @Query("SELECT hh FROM HandoverHistory hh WHERE hh.activityDate BETWEEN :startDate AND :endDate " +
           "ORDER BY hh.activityDate DESC")
    List<HandoverHistory> findByActivityDateRange(@Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);

    /**
     * 인수인계 지정의 최근 이력 조회
     */
    @Query("SELECT hh FROM HandoverHistory hh WHERE hh.assignmentId = :assignmentId " +
           "ORDER BY hh.activityDate DESC")
    List<HandoverHistory> findRecentHistoryByAssignmentId(@Param("assignmentId") Long assignmentId, Pageable pageable);

    /**
     * 특정 활동 유형의 최근 이력 조회
     */
    @Query("SELECT hh FROM HandoverHistory hh WHERE hh.activityType = :activityType " +
           "ORDER BY hh.activityDate DESC")
    List<HandoverHistory> findRecentHistoryByActivityType(@Param("activityType") HandoverHistory.ActivityType activityType,
                                                          Pageable pageable);

    /**
     * 작업자의 활동 이력 조회 (페이징)
     */
    @Query("SELECT hh FROM HandoverHistory hh WHERE hh.actorEmpNo = :actorEmpNo " +
           "ORDER BY hh.activityDate DESC")
    Page<HandoverHistory> findByActorEmpNoOrderByActivityDateDesc(@Param("actorEmpNo") String actorEmpNo,
                                                                  Pageable pageable);

    /**
     * 복합 조건 검색
     */
    @Query("SELECT hh FROM HandoverHistory hh WHERE " +
           "(:assignmentId IS NULL OR hh.assignmentId = :assignmentId) AND " +
           "(:activityType IS NULL OR hh.activityType = :activityType) AND " +
           "(:actorEmpNo IS NULL OR hh.actorEmpNo LIKE %:actorEmpNo%) AND " +
           "(:relatedEntityType IS NULL OR hh.relatedEntityType = :relatedEntityType) AND " +
           "(:startDate IS NULL OR hh.activityDate >= :startDate) AND " +
           "(:endDate IS NULL OR hh.activityDate <= :endDate) " +
           "ORDER BY hh.activityDate DESC")
    Page<HandoverHistory> findBySearchCriteria(@Param("assignmentId") Long assignmentId,
                                               @Param("activityType") HandoverHistory.ActivityType activityType,
                                               @Param("actorEmpNo") String actorEmpNo,
                                               @Param("relatedEntityType") HandoverHistory.RelatedEntityType relatedEntityType,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate,
                                               Pageable pageable);

    /**
     * 활동 유형별 통계
     */
    @Query("SELECT hh.activityType, COUNT(hh) FROM HandoverHistory hh GROUP BY hh.activityType")
    List<Object[]> getActivityStatistics();

    /**
     * 연관 엔티티 타입별 통계
     */
    @Query("SELECT hh.relatedEntityType, COUNT(hh) FROM HandoverHistory hh " +
           "WHERE hh.relatedEntityType IS NOT NULL GROUP BY hh.relatedEntityType")
    List<Object[]> getEntityTypeStatistics();

    /**
     * 작업자별 활동 통계
     */
    @Query("SELECT hh.actorEmpNo, COUNT(hh) FROM HandoverHistory hh " +
           "WHERE hh.actorEmpNo IS NOT NULL GROUP BY hh.actorEmpNo")
    List<Object[]> getActorStatistics();

    /**
     * 일별 활동 통계
     */
    @Query("SELECT DATE(hh.activityDate), COUNT(hh) FROM HandoverHistory hh " +
           "WHERE hh.activityDate >= :startDate " +
           "GROUP BY DATE(hh.activityDate) " +
           "ORDER BY DATE(hh.activityDate) DESC")
    List<Object[]> getDailyActivityStatistics(@Param("startDate") LocalDateTime startDate);

    /**
     * 월별 활동 통계
     */
    @Query("SELECT YEAR(hh.activityDate), MONTH(hh.activityDate), COUNT(hh) " +
           "FROM HandoverHistory hh " +
           "GROUP BY YEAR(hh.activityDate), MONTH(hh.activityDate) " +
           "ORDER BY YEAR(hh.activityDate) DESC, MONTH(hh.activityDate) DESC")
    List<Object[]> getMonthlyActivityStatistics();

    /**
     * 인수인계 지정별 활동 수 조회
     */
    @Query("SELECT hh.assignmentId, COUNT(hh) FROM HandoverHistory hh GROUP BY hh.assignmentId")
    List<Object[]> countByAssignmentId();

    /**
     * 최근 활동 이력 조회 (전체)
     */
    @Query("SELECT hh FROM HandoverHistory hh ORDER BY hh.activityDate DESC")
    List<HandoverHistory> findRecentActivities(Pageable pageable);

    /**
     * 특정 인수인계의 활동 유형별 최신 이력 조회
     */
    @Query("SELECT hh FROM HandoverHistory hh WHERE hh.assignmentId = :assignmentId AND hh.activityType = :activityType " +
           "ORDER BY hh.activityDate DESC")
    List<HandoverHistory> findLatestByAssignmentIdAndActivityType(@Param("assignmentId") Long assignmentId,
                                                                  @Param("activityType") HandoverHistory.ActivityType activityType,
                                                                  Pageable pageable);
}