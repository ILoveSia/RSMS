package org.itcen.domain.handover.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.handover.entity.HandoverAssignment;
import org.itcen.domain.handover.entity.HandoverHistory;
import org.itcen.domain.handover.repository.HandoverAssignmentRepository;
import org.itcen.domain.handover.repository.HandoverHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 인수인계 지정 서비스 구현체
 * 인수인계 지정 관련 비즈니스 로직을 구현합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 비즈니스 로직만 담당
 * - Open/Closed: 새로운 인수인계 기능 추가 시 확장 가능
 * - Liskov Substitution: HandoverService 인터페이스 준수
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HandoverServiceImpl implements HandoverService {

    private final HandoverAssignmentRepository handoverAssignmentRepository;
    private final HandoverHistoryRepository handoverHistoryRepository;

    @Override
    @Transactional
    public HandoverAssignment createHandoverAssignment(HandoverAssignment handoverAssignment) {

        // 인수인계 지정 저장
        HandoverAssignment savedAssignment = handoverAssignmentRepository.save(handoverAssignment);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createAssignmentHistory(
                savedAssignment.getAssignmentId(),
                HandoverHistory.ActivityType.ASSIGNMENT_CREATED,
                "인수인계 지정이 생성되었습니다.",
                savedAssignment.getCreatedId(),
                null // actorName은 별도로 조회하여 설정
        );
        handoverHistoryRepository.save(history);

        log.debug("인수인계 지정 생성 완료 - assignmentId: {}", savedAssignment.getAssignmentId());
        return savedAssignment;
    }

    @Override
    @Transactional
    public HandoverAssignment updateHandoverAssignment(Long assignmentId, HandoverAssignment handoverAssignment) {
        log.debug("인수인계 지정 수정 시작 - assignmentId: {}", assignmentId);

        HandoverAssignment existingAssignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 수정 가능 여부 확인 (완료된 인수인계는 수정 불가)
        if (existingAssignment.getStatus() == HandoverAssignment.HandoverStatus.COMPLETED) {
            throw new BusinessException("완료된 인수인계는 수정할 수 없습니다.");
        }

        // 필드 업데이트
        existingAssignment.setHandoverType(handoverAssignment.getHandoverType());
        existingAssignment.setHandoverFromEmpNo(handoverAssignment.getHandoverFromEmpNo());
        existingAssignment.setHandoverToEmpNo(handoverAssignment.getHandoverToEmpNo());
        existingAssignment.setPlannedStartDate(handoverAssignment.getPlannedStartDate());
        existingAssignment.setPlannedEndDate(handoverAssignment.getPlannedEndDate());
        existingAssignment.setNotes(handoverAssignment.getNotes());
        existingAssignment.setUpdatedId(handoverAssignment.getUpdatedId());

        HandoverAssignment savedAssignment = handoverAssignmentRepository.save(existingAssignment);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createAssignmentHistory(
                savedAssignment.getAssignmentId(),
                HandoverHistory.ActivityType.ASSIGNMENT_UPDATED,
                "인수인계 지정이 수정되었습니다.",
                savedAssignment.getUpdatedId(),
                null
        );
        handoverHistoryRepository.save(history);

        log.debug("인수인계 지정 수정 완료 - assignmentId: {}", assignmentId);
        return savedAssignment;
    }

    @Override
    public Optional<HandoverAssignment> getHandoverAssignment(Long assignmentId) {
        log.debug("인수인계 지정 조회 - assignmentId: {}", assignmentId);
        return handoverAssignmentRepository.findById(assignmentId);
    }

    @Override
    @Transactional
    public void deleteHandoverAssignment(Long assignmentId) {
        log.debug("인수인계 지정 삭제 시작 - assignmentId: {}", assignmentId);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 삭제 가능 여부 확인 (진행중이거나 완료된 인수인계는 삭제 불가)
        if (assignment.getStatus() == HandoverAssignment.HandoverStatus.IN_PROGRESS ||
            assignment.getStatus() == HandoverAssignment.HandoverStatus.COMPLETED) {
            throw new BusinessException("진행중이거나 완료된 인수인계는 삭제할 수 없습니다.");
        }

        handoverAssignmentRepository.delete(assignment);
        log.debug("인수인계 지정 삭제 완료 - assignmentId: {}", assignmentId);
    }

    @Override
    public Page<HandoverAssignment> getAllHandoverAssignments(Pageable pageable) {
        log.debug("모든 인수인계 지정 조회 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return handoverAssignmentRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void startHandover(Long assignmentId, String actorEmpNo) {
        log.debug("인수인계 시작 - assignmentId: {}, actorEmpNo: {}", assignmentId, actorEmpNo);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 시작 가능 여부 확인
        if (assignment.getStatus() != HandoverAssignment.HandoverStatus.PLANNED) {
            throw new BusinessException("계획 상태의 인수인계만 시작할 수 있습니다.");
        }

        // 인수인계 시작
        assignment.setUpdatedId(actorEmpNo);
        handoverAssignmentRepository.save(assignment);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createAssignmentHistory(
                assignmentId,
                HandoverHistory.ActivityType.ASSIGNMENT_STARTED,
                "인수인계가 시작되었습니다.",
                actorEmpNo,
                null
        );
        handoverHistoryRepository.save(history);

        log.debug("인수인계 시작 완료 - assignmentId: {}", assignmentId);
    }

    @Override
    @Transactional
    public void completeHandover(Long assignmentId, String actorEmpNo) {
        log.debug("인수인계 완료 - assignmentId: {}, actorEmpNo: {}", assignmentId, actorEmpNo);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 완료 가능 여부 확인
        if (assignment.getStatus() != HandoverAssignment.HandoverStatus.IN_PROGRESS) {
            throw new BusinessException("진행중인 인수인계만 완료할 수 있습니다.");
        }

        // 인수인계 완료
        assignment.setUpdatedId(actorEmpNo);
        handoverAssignmentRepository.save(assignment);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createAssignmentHistory(
                assignmentId,
                HandoverHistory.ActivityType.ASSIGNMENT_COMPLETED,
                "인수인계가 완료되었습니다.",
                actorEmpNo,
                null
        );
        handoverHistoryRepository.save(history);

        log.debug("인수인계 완료 - assignmentId: {}", assignmentId);
    }

    @Override
    @Transactional
    public void cancelHandover(Long assignmentId, String actorEmpNo, String reason) {
        log.debug("인수인계 취소 - assignmentId: {}, actorEmpNo: {}", assignmentId, actorEmpNo);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new BusinessException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 취소 가능 여부 확인
        if (assignment.getStatus() == HandoverAssignment.HandoverStatus.COMPLETED) {
            throw new BusinessException("완료된 인수인계는 취소할 수 없습니다.");
        }

        // 인수인계 취소
        assignment.cancelHandover();
        assignment.setUpdatedId(actorEmpNo);
        handoverAssignmentRepository.save(assignment);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createAssignmentHistory(
                assignmentId,
                HandoverHistory.ActivityType.STATUS_CHANGED,
                "인수인계가 취소되었습니다. 사유: " + (reason != null ? reason : "사유 없음"),
                actorEmpNo,
                null
        );
        handoverHistoryRepository.save(history);

        log.debug("인수인계 취소 완료 - assignmentId: {}", assignmentId);
    }


    // 조회 메서드들은 실제 DTO 변환 로직으로 구현 예정
    // 현재는 기본 구조만 제공


    @Override
    public List<HandoverAssignmentDto> getHandoverAssignmentsByEmployee(String empNo) {
        log.debug("사용자별 인수인계 현황 조회 - empNo: {}", empNo);
        List<HandoverAssignment> assignments = handoverAssignmentRepository.findByEmployeeNo(empNo);
        return convertToDto(assignments);
    }

    @Override
    public List<HandoverAssignmentDto> getHandoverAssignmentsByStatus(HandoverAssignment.HandoverStatus status) {
        log.debug("상태별 인수인계 지정 조회 - status: {}", status);
        List<HandoverAssignment> assignments = handoverAssignmentRepository.findByStatus(status);
        return convertToDto(assignments);
    }

    @Override
    public List<HandoverAssignmentDto> getActiveHandovers() {
        log.debug("진행중인 인수인계 조회");
        List<HandoverAssignment> assignments = handoverAssignmentRepository.findActiveHandovers();
        return convertToDto(assignments);
    }

    @Override
    public List<HandoverAssignmentDto> getDelayedHandovers() {
        log.debug("지연된 인수인계 조회");
        List<HandoverAssignment> assignments = handoverAssignmentRepository.findDelayedHandovers(LocalDate.now());
        return convertToDto(assignments);
    }

    @Override
    public Page<HandoverAssignmentDto> searchHandoverAssignments(HandoverAssignmentSearchDto searchDto, Pageable pageable) {
        log.debug("복합 조건 검색 - searchDto: {}", searchDto);
        
        Page<HandoverAssignment> assignments = handoverAssignmentRepository.findBySearchCriteria(
                searchDto.getHandoverType(),
                searchDto.getStatus(),
                searchDto.getHandoverFromEmpNo(),
                searchDto.getHandoverToEmpNo(),
                pageable
        );
        
        return assignments.map(this::convertToDto);
    }

    // Private helper methods

    private List<HandoverAssignmentDto> convertToDto(List<HandoverAssignment> assignments) {
        return assignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private HandoverAssignmentDto convertToDto(HandoverAssignment assignment) {
        return new HandoverAssignmentDto() {
            @Override
            public Long getAssignmentId() { return assignment.getAssignmentId(); }
            
            
            @Override
            public HandoverAssignment.HandoverType getHandoverType() { return assignment.getHandoverType(); }
            
            @Override
            public String getHandoverFromEmpNo() { return assignment.getHandoverFromEmpNo(); }
            
            @Override           
            public String getHandoverToEmpNo() { return assignment.getHandoverToEmpNo(); }
            
            
            @Override
            public LocalDate getPlannedStartDate() { return assignment.getPlannedStartDate(); }
            
            @Override
            public LocalDate getPlannedEndDate() { return assignment.getPlannedEndDate(); }
            
            @Override
            public HandoverAssignment.HandoverStatus getStatus() { return assignment.getStatus(); }
            
            
            @Override
            public String getNotes() { return assignment.getNotes(); }
        };
    }
}