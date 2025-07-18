package org.itcen.domain.positions.repository;

import org.itcen.domain.positions.entity.PositionMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 직책 회의체 Repository
 * 
 * 직책 회의체 엔티티에 대한 데이터 액세스를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 회의체 데이터 액세스만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface PositionMeetingRepository extends JpaRepository<PositionMeeting, Long> {

    /**
     * 특정 직책의 회의체 목록 조회
     */
    List<PositionMeeting> findByPositionsId(Long positionsId);

    /**
     * 특정 회의체에 참여하는 직책 목록 조회
     */
    List<PositionMeeting> findByMeetingBodyId(String meetingBodyId);

    /**
     * 특정 직책의 모든 회의체 삭제
     */
    void deleteByPositionsId(Long positionsId);

    /**
     * 특정 회의체의 모든 직책 삭제
     */
    void deleteByMeetingBodyId(String meetingBodyId);

    /**
     * 직책-회의체 조합 존재 여부 확인
     */
    boolean existsByPositionsIdAndMeetingBodyId(Long positionsId, String meetingBodyId);

    /**
     * 특정 직책의 회의체 개수 조회
     */
    Long countByPositionsId(Long positionsId);

    /**
     * 특정 회의체의 직책 개수 조회
     */
    Long countByMeetingBodyId(String meetingBodyId);

    void deleteByPosition_PositionsId(Long positionsId);

    List<PositionMeeting> findByPosition_PositionsId(Long positionsId);
} 