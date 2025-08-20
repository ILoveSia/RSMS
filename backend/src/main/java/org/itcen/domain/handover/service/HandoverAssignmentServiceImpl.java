package org.itcen.domain.handover.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.dto.HandoverAssignmentDto;
import org.itcen.domain.handover.entity.HandoverAssignment;
import org.itcen.domain.handover.repository.HandoverAssignmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 인수인계 지정 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HandoverAssignmentServiceImpl implements HandoverAssignmentService {

    private final HandoverAssignmentRepository handoverAssignmentRepository;

    @Override
    public Page<HandoverAssignmentDto> getAssignments(Pageable pageable) {
        log.info("인수인계 지정 목록 조회 - 페이지: {}, 크기: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<HandoverAssignment> assignments = handoverAssignmentRepository.findAll(pageable);
        return assignments.map(this::convertToDto);
    }

    @Override
    public Page<HandoverAssignmentDto> searchAssignments(
            String status,
            String handoverType,
            String fromEmpNo,
            String toEmpNo,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {

        log.info("인수인계 지정 검색 - 상태: {}, 유형: {}, 인계자: {}, 인수자: {}",
                status, handoverType, fromEmpNo, toEmpNo);

        // String을 enum으로 변환
        HandoverAssignment.HandoverStatus statusEnum = null;
        if (status != null) {
            try {
                statusEnum = HandoverAssignment.HandoverStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", status);
            }
        }

        HandoverAssignment.HandoverType typeEnum = null;
        if (handoverType != null) {
            try {
                typeEnum = HandoverAssignment.HandoverType.valueOf(handoverType);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid handoverType value: {}", handoverType);
            }
        }

        Page<HandoverAssignment> assignments = handoverAssignmentRepository.findBySearchConditions(
                statusEnum, typeEnum, fromEmpNo, toEmpNo, startDate, endDate, pageable);

        return assignments.map(this::convertToDto);
    }

    @Override
    public HandoverAssignmentDto getAssignment(Long assignmentId) {
        log.info("인수인계 지정 상세 조회 - ID: {}", assignmentId);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        return convertToDto(assignment);
    }

    @Override
    @Transactional
    public HandoverAssignmentDto createAssignment(HandoverAssignmentDto dto, String actorId) {
        log.info("인수인계 지정 생성 - 인계자: {}, 인수자: {}, 생성자: {}",
                dto.getHandoverFromEmpNo(), dto.getHandoverToEmpNo(), actorId);

        // 중복 검증
        validateDuplicateHandoverRelation(dto.getHandoverFromEmpNo(), dto.getHandoverToEmpNo());

        // String을 enum으로 변환
        HandoverAssignment.HandoverType typeEnum = null;
        if (dto.getHandoverType() != null) {
            try {
                typeEnum = HandoverAssignment.HandoverType.valueOf(dto.getHandoverType());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid handoverType value: {}", dto.getHandoverType());
                typeEnum = HandoverAssignment.HandoverType.POSITION; // 기본값
            }
        }

        HandoverAssignment assignment = HandoverAssignment.builder()
                .handoverType(typeEnum)
                .handoverFromEmpNo(dto.getHandoverFromEmpNo())
                .handoverToEmpNo(dto.getHandoverToEmpNo())
                .plannedStartDate(dto.getPlannedStartDate())
                .plannedEndDate(dto.getPlannedEndDate())
                .status(HandoverAssignment.HandoverStatus.PLANNED)
                .notes(dto.getNotes())
                .build();

        assignment.setCreatedId(actorId);
        assignment.setUpdatedId(actorId);

        HandoverAssignment savedAssignment = handoverAssignmentRepository.save(assignment);
        return convertToDto(savedAssignment);
    }

    @Override
    @Transactional
    public HandoverAssignmentDto updateAssignment(Long assignmentId, HandoverAssignmentDto dto, String actorId) {
        log.info("인수인계 지정 수정 - ID: {}, 수정자: {}", assignmentId, actorId);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 중복 검증 (자기 자신 제외)
        validateDuplicateHandoverRelationForUpdate(assignmentId, dto.getHandoverFromEmpNo(), dto.getHandoverToEmpNo());

        // 수정 가능한 필드만 업데이트
        // handoverType 변환 및 설정
        if (dto.getHandoverType() != null) {
            try {
                HandoverAssignment.HandoverType typeEnum = HandoverAssignment.HandoverType.valueOf(dto.getHandoverType());
                assignment.setHandoverType(typeEnum);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid handoverType value: {}", dto.getHandoverType());
            }
        }
        
        // status 변환 및 설정
        if (dto.getStatus() != null) {
            try {
                HandoverAssignment.HandoverStatus statusEnum = HandoverAssignment.HandoverStatus.valueOf(dto.getStatus());
                assignment.setStatus(statusEnum);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", dto.getStatus());
            }
        }
        
        assignment.setHandoverFromEmpNo(dto.getHandoverFromEmpNo());
        assignment.setHandoverToEmpNo(dto.getHandoverToEmpNo());
        assignment.setPlannedStartDate(dto.getPlannedStartDate());
        assignment.setPlannedEndDate(dto.getPlannedEndDate());
        assignment.setNotes(dto.getNotes());
        assignment.setUpdatedId(actorId);

        HandoverAssignment updatedAssignment = handoverAssignmentRepository.save(assignment);
        return convertToDto(updatedAssignment);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId, String actorId) {
        log.info("인수인계 지정 삭제 - ID: {}, 삭제자: {}", assignmentId, actorId);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        // 진행 중인 인수인계는 삭제 불가
        if (HandoverAssignment.HandoverStatus.IN_PROGRESS.equals(assignment.getStatus())) {
            throw new RuntimeException("진행 중인 인수인계는 삭제할 수 없습니다.");
        }

        handoverAssignmentRepository.delete(assignment);
    }

    @Override
    @Transactional
    public HandoverAssignmentDto startHandover(Long assignmentId, String actorId) {
        log.info("인수인계 시작 - ID: {}, 시작자: {}", assignmentId, actorId);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        if (!HandoverAssignment.HandoverStatus.PLANNED.equals(assignment.getStatus())) {
            throw new RuntimeException("계획 상태의 인수인계만 시작할 수 있습니다.");
        }

        assignment.setStatus(HandoverAssignment.HandoverStatus.IN_PROGRESS);
        assignment.setActualStartDate(LocalDateTime.now());
        assignment.setUpdatedId(actorId);

        HandoverAssignment updatedAssignment = handoverAssignmentRepository.save(assignment);
        return convertToDto(updatedAssignment);
    }

    @Override
    @Transactional
    public HandoverAssignmentDto completeHandover(Long assignmentId, String actorId) {
        log.info("인수인계 완료 - ID: {}, 완료자: {}", assignmentId, actorId);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        if (!HandoverAssignment.HandoverStatus.IN_PROGRESS.equals(assignment.getStatus())) {
            throw new RuntimeException("진행 중인 인수인계만 완료할 수 있습니다.");
        }

        assignment.setStatus(HandoverAssignment.HandoverStatus.COMPLETED);
        assignment.setActualEndDate(LocalDateTime.now());
        assignment.setUpdatedId(actorId);

        HandoverAssignment updatedAssignment = handoverAssignmentRepository.save(assignment);
        return convertToDto(updatedAssignment);
    }

    @Override
    @Transactional
    public HandoverAssignmentDto cancelHandover(Long assignmentId, String reason, String actorId) {
        log.info("인수인계 취소 - ID: {}, 취소자: {}, 사유: {}", assignmentId, actorId, reason);

        HandoverAssignment assignment = handoverAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("인수인계 지정을 찾을 수 없습니다: " + assignmentId));

        if (HandoverAssignment.HandoverStatus.COMPLETED.equals(assignment.getStatus())) {
            throw new RuntimeException("완료된 인수인계는 취소할 수 없습니다.");
        }

        assignment.setStatus(HandoverAssignment.HandoverStatus.CANCELLED);
        String currentNotes = assignment.getNotes() != null ? assignment.getNotes() : "";
        assignment.setNotes(currentNotes + "\n[취소 사유] " + reason);
        assignment.setUpdatedId(actorId);

        HandoverAssignment updatedAssignment = handoverAssignmentRepository.save(assignment);
        return convertToDto(updatedAssignment);
    }

    @Override
    public List<HandoverAssignmentDto> getAssignmentsByEmployee(String empNo) {
        log.info("사용자별 인수인계 목록 조회 - 사번: {}", empNo);

        List<HandoverAssignment> fromAssignments = handoverAssignmentRepository.findByHandoverFromEmpNo(empNo);
        List<HandoverAssignment> toAssignments = handoverAssignmentRepository.findByHandoverToEmpNo(empNo);

        List<HandoverAssignmentDto> result = fromAssignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        result.addAll(toAssignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()));

        return result;
    }

    @Override
    public List<HandoverAssignmentDto> getDelayedAssignments() {
        log.info("지연된 인수인계 목록 조회");

        List<HandoverAssignment> delayedAssignments = handoverAssignmentRepository.findDelayedAssignments();
        return delayedAssignments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    /**
     * 인수인계 관계 중복 검증 (생성 시)
     */
    private void validateDuplicateHandoverRelation(String fromEmpNo, String toEmpNo) {
        if (fromEmpNo == null || toEmpNo == null) {
            return;
        }

        boolean exists = handoverAssignmentRepository.existsByHandoverFromEmpNoAndHandoverToEmpNo(fromEmpNo, toEmpNo);
        if (exists) {
            throw new RuntimeException(String.format("이미 동일한 인계자(%s)와 인수자(%s) 관계의 인수인계 지정이 존재합니다.", fromEmpNo, toEmpNo));
        }
    }

    /**
     * 인수인계 관계 중복 검증 (수정 시 - 자기 자신 제외)
     */
    private void validateDuplicateHandoverRelationForUpdate(Long assignmentId, String fromEmpNo, String toEmpNo) {
        if (fromEmpNo == null || toEmpNo == null) {
            return;
        }

        boolean exists = handoverAssignmentRepository.existsByHandoverFromEmpNoAndHandoverToEmpNoExcludingId(assignmentId, fromEmpNo, toEmpNo);
        if (exists) {
            throw new RuntimeException(String.format("이미 동일한 인계자(%s)와 인수자(%s) 관계의 인수인계 지정이 존재합니다.", fromEmpNo, toEmpNo));
        }
    }

    /**
     * 엔티티를 DTO로 변환
     */
    private HandoverAssignmentDto convertToDto(HandoverAssignment assignment) {
        HandoverAssignmentDto dto = HandoverAssignmentDto.builder()
                .assignmentId(assignment.getAssignmentId())
                .handoverType(assignment.getHandoverType() != null ? assignment.getHandoverType().name() : null)
                .handoverFromEmpNo(assignment.getHandoverFromEmpNo())

                .handoverToEmpNo(assignment.getHandoverToEmpNo())

                .plannedStartDate(assignment.getPlannedStartDate())
                .plannedEndDate(assignment.getPlannedEndDate())
                .actualStartDate(assignment.getActualStartDate())
                .actualEndDate(assignment.getActualEndDate())
                .status(assignment.getStatus() != null ? assignment.getStatus().name() : null)
                .notes(assignment.getNotes())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .createdId(assignment.getCreatedId())
                .updatedId(assignment.getUpdatedId())
                .build();

        // 프론트엔드 호환성을 위한 매핑
        dto.mapForFrontend();

        return dto;
    }
}