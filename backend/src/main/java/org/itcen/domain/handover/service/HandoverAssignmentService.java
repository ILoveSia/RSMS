package org.itcen.domain.handover.service;

import org.itcen.domain.handover.dto.HandoverAssignmentDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * 인수인계 지정 서비스 인터페이스
 */
public interface HandoverAssignmentService {

    /**
     * 인수인계 지정 목록 조회
     */
    Page<HandoverAssignmentDto> getAssignments(Pageable pageable);

    /**
     * 조건별 인수인계 지정 검색
     */
    Page<HandoverAssignmentDto> searchAssignments(
            String status,
            String handoverType,
            String fromEmpNo,
            String toEmpNo,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable);

    /**
     * 인수인계 지정 상세 조회
     */
    HandoverAssignmentDto getAssignment(Long assignmentId);

    /**
     * 인수인계 지정 생성
     */
    HandoverAssignmentDto createAssignment(HandoverAssignmentDto dto, String actorId);

    /**
     * 인수인계 지정 수정
     */
    HandoverAssignmentDto updateAssignment(Long assignmentId, HandoverAssignmentDto dto, String actorId);

    /**
     * 인수인계 지정 삭제
     */
    void deleteAssignment(Long assignmentId, String actorId);

    /**
     * 인수인계 시작
     */
    HandoverAssignmentDto startHandover(Long assignmentId, String actorId);

    /**
     * 인수인계 완료
     */
    HandoverAssignmentDto completeHandover(Long assignmentId, String actorId);

    /**
     * 인수인계 취소
     */
    HandoverAssignmentDto cancelHandover(Long assignmentId, String reason, String actorId);

    /**
     * 사용자별 인수인계 목록 조회
     */
    List<HandoverAssignmentDto> getAssignmentsByEmployee(String empNo);

    /**
     * 지연된 인수인계 목록 조회
     */
    List<HandoverAssignmentDto> getDelayedAssignments();

    /**
     * 인수인계 통계 DTO
     */
    record HandoverAssignmentStatistics(
            long totalCount,
            long plannedCount,
            long inProgressCount,
            long completedCount,
            long cancelledCount,
            long delayedCount
    ) {}
}