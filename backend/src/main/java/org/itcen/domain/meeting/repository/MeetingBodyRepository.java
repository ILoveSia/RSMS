package org.itcen.domain.meeting.repository;

import org.itcen.domain.meeting.entity.MeetingBody;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 회의체 Repository
 * 
 * 회의체 데이터 접근을 담당하는 Repository입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 회의체 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 인터페이스를 통한 의존성 역전
 */
@Repository
public interface MeetingBodyRepository extends JpaRepository<MeetingBody, String> {

    /**
     * 구분별 회의체 목록 조회
     * 
     * @param gubun 구분
     * @return 회의체 목록
     */
    List<MeetingBody> findByGubunOrderByCreatedAtDesc(String gubun);

    /**
     * 회의체명으로 검색
     * 
     * @param meetingName 회의체명 (부분 검색)
     * @param pageable 페이징 정보
     * @return 페이징된 회의체 목록
     */
    Page<MeetingBody> findByMeetingNameContainingIgnoreCaseOrderByCreatedAtDesc(String meetingName, Pageable pageable);

    /**
     * 개최주기별 회의체 목록 조회
     * 
     * @param meetingPeriod 개최주기
     * @return 회의체 목록
     */
    List<MeetingBody> findByMeetingPeriodOrderByCreatedAtDesc(String meetingPeriod);

    /**
     * 복합 검색 (구분, 회의체명, 개최주기, 내용)
     * 
     * @param gubun 구분 (선택)
     * @param meetingName 회의체명 (부분 검색, 선택)
     * @param meetingPeriod 개최주기 (선택)
     * @param content 내용 (부분 검색, 선택)
     * @param pageable 페이징 정보
     * @return 페이징된 회의체 목록
     */
    @Query(value = "SELECT * FROM meeting_body m WHERE " +
           "(:gubun IS NULL OR m.gubun = :gubun) AND " +
           "(:meetingName IS NULL OR LOWER(m.meeting_name::text) LIKE LOWER(CONCAT('%', :meetingName, '%'))) AND " +
           "(:meetingPeriod IS NULL OR m.meeting_period = :meetingPeriod) AND " +
           "(:content IS NULL OR LOWER(m.content::text) LIKE LOWER(CONCAT('%', :content, '%'))) " +
           "ORDER BY m.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM meeting_body m WHERE " +
           "(:gubun IS NULL OR m.gubun = :gubun) AND " +
           "(:meetingName IS NULL OR LOWER(m.meeting_name::text) LIKE LOWER(CONCAT('%', :meetingName, '%'))) AND " +
           "(:meetingPeriod IS NULL OR m.meeting_period = :meetingPeriod) AND " +
           "(:content IS NULL OR LOWER(m.content::text) LIKE LOWER(CONCAT('%', :content, '%')))",
           nativeQuery = true)
    Page<MeetingBody> findBySearchConditions(
            @Param("gubun") String gubun,
            @Param("meetingName") String meetingName,
            @Param("meetingPeriod") String meetingPeriod,
            @Param("content") String content,
            Pageable pageable
    );
    /**
     * 회의체명 중복 체크
     * 
     * @param meetingName 회의체명
     * @return 존재 여부
     */
    boolean existsByMeetingName(String meetingName);

    /**
     * 회의체명 중복 체크 (수정 시, 자신 제외)
     * 
     * @param meetingName 회의체명
     * @param id 자신의 ID
     * @return 존재 여부
     */
    boolean existsByMeetingNameAndMeetingBodyIdNot(String meetingName, String id);

    /**
     * 실제 데이터베이스에 존재하는 gubun 값들 조회 (디버깅용)
     * 
     * @return gubun 값 목록
     */
    @Query(value = "SELECT DISTINCT m.gubun FROM meeting_body m WHERE m.gubun IS NOT NULL ORDER BY m.gubun", nativeQuery = true)
    List<String> findDistinctGubunValues();
}