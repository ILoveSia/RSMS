package org.itcen.domain.handover.service;

import org.itcen.domain.handover.entity.HandoverAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 인수인계 지정 서비스 인터페이스
 * 인수인계 지정 관련 비즈니스 로직을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 비즈니스 로직만 담당
 * - Open/Closed: 새로운 인수인계 기능 추가 시 확장 가능
 * - Liskov Substitution: 구현체 간 호환성 보장
 * - Interface Segregation: 인수인계 관련 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface HandoverService {

    // 기본 CRUD 작업

    /**
     * 인수인계 지정 생성
     */
    HandoverAssignment createHandoverAssignment(HandoverAssignment handoverAssignment);

    /**
     * 인수인계 지정 수정
     */
    HandoverAssignment updateHandoverAssignment(Long assignmentId, HandoverAssignment handoverAssignment);

    /**
     * 인수인계 지정 조회
     */
    Optional<HandoverAssignment> getHandoverAssignment(Long assignmentId);

    /**
     * 인수인계 지정 삭제
     */
    void deleteHandoverAssignment(Long assignmentId);

    /**
     * 모든 인수인계 지정 조회 (페이징)
     */
    Page<HandoverAssignment> getAllHandoverAssignments(Pageable pageable);

    // 비즈니스 로직

    /**
     * 인수인계 시작
     */
    void startHandover(Long assignmentId, String actorEmpNo);

    /**
     * 인수인계 완료
     */
    void completeHandover(Long assignmentId, String actorEmpNo);

    /**
     * 인수인계 취소
     */
    void cancelHandover(Long assignmentId, String actorEmpNo, String reason);

    // 조회 기능

    /**
     * 직책별 인수인계 지정 조회
     */

    /**
     * 사용자별 인수인계 현황 조회 (인계자 또는 인수자)
     */
    List<HandoverAssignmentDto> getHandoverAssignmentsByEmployee(String empNo);

    /**
     * 상태별 인수인계 지정 조회
     */
    List<HandoverAssignmentDto> getHandoverAssignmentsByStatus(HandoverAssignment.HandoverStatus status);

    /**
     * 진행중인 인수인계 조회
     */
    List<HandoverAssignmentDto> getActiveHandovers();

    /**
     * 지연된 인수인계 조회
     */
    List<HandoverAssignmentDto> getDelayedHandovers();

    /**
     * 복합 조건 검색
     */
    Page<HandoverAssignmentDto> searchHandoverAssignments(HandoverAssignmentSearchDto searchDto, Pageable pageable);
    // DTO 클래스들 (내부 정의)

    interface HandoverAssignmentDto {
        Long getAssignmentId();
        HandoverAssignment.HandoverType getHandoverType();
        String getHandoverFromEmpNo();
        String getHandoverToEmpNo();
        LocalDate getPlannedStartDate();
        LocalDate getPlannedEndDate();
        HandoverAssignment.HandoverStatus getStatus();
        String getNotes();
    }

    interface HandoverAssignmentSearchDto {
        HandoverAssignment.HandoverType getHandoverType();
        HandoverAssignment.HandoverStatus getStatus();
        String getHandoverFromEmpNo();
        String getHandoverToEmpNo();
        LocalDate getStartDate();
        LocalDate getEndDate();
    }
}