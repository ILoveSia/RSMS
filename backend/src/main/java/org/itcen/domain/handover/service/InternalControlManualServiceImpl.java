package org.itcen.domain.handover.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.handover.entity.InternalControlManual;
import org.itcen.domain.handover.entity.HandoverHistory;
import org.itcen.domain.handover.repository.InternalControlManualRepository;
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
 * 내부통제 업무메뉴얼 서비스 구현체
 * 내부통제 업무메뉴얼 관련 비즈니스 로직을 구현합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 메뉴얼 비즈니스 로직만 담당
 * - Open/Closed: 새로운 메뉴얼 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: InternalControlManualService 인터페이스 준수
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InternalControlManualServiceImpl implements InternalControlManualService {

    private final InternalControlManualRepository internalControlManualRepository;
    private final HandoverHistoryRepository handoverHistoryRepository;

    @Override
    @Transactional
    public InternalControlManual createManual(InternalControlManual manual) {
        log.debug("내부통제 메뉴얼 생성 시작 - deptCd: {}, title: {}", 
                  manual.getDeptCd(), manual.getManualTitle());

        // reviewer/approver 정보가 누락된 경우를 위해 명시적으로 set (이미 값이 있으면 그대로)
        InternalControlManual entity = InternalControlManual.builder()
            .manualTitle(manual.getManualTitle())
            .manualContent(manual.getManualContent())
            .manualVersion(manual.getManualVersion())
            .status(manual.getStatus())
            .deptCd(manual.getDeptCd())
            .authorEmpNo(manual.getAuthorEmpNo())
            .reviewerEmpNo(manual.getReviewerEmpNo())
            .approverEmpNo(manual.getApproverEmpNo())
            .createdId(manual.getCreatedId())
            .updatedId(manual.getUpdatedId())
            .effectiveDate(manual.getEffectiveDate())
            .expiryDate(manual.getExpiryDate())
            .build();

        InternalControlManual savedManual = internalControlManualRepository.save(entity);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_CREATED,
                "내부통제 업무메뉴얼이 생성되었습니다.",
                savedManual.getCreatedId(),
                null, // actorName
                savedManual.getManualId()
        );
        handoverHistoryRepository.save(history);

        log.debug("내부통제 메뉴얼 생성 완료 - manualId: {}", savedManual.getManualId());
        return savedManual;
    }

    @Override
    @Transactional
    public InternalControlManual updateManual(Long manualId, InternalControlManual manual) {
        log.debug("내부통제 메뉴얼 수정 시작 - manualId: {}", manualId);

        InternalControlManual existingManual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 수정 가능 여부 확인 (발행된 메뉴얼은 수정 불가)
        if (existingManual.getStatus() == InternalControlManual.ManualStatus.PUBLISHED) {
            throw new BusinessException("발행된 내부통제 업무메뉴얼은 수정할 수 없습니다.");
        }

        // 필드 업데이트
        existingManual.setManualTitle(manual.getManualTitle());
        existingManual.setManualContent(manual.getManualContent());
        existingManual.setManualVersion(manual.getManualVersion());
        existingManual.setStatus(manual.getStatus());
        existingManual.setDeptCd(manual.getDeptCd());
        existingManual.setEffectiveDate(manual.getEffectiveDate());
        existingManual.setExpiryDate(manual.getExpiryDate());
        existingManual.setAuthorEmpNo(manual.getAuthorEmpNo());
        existingManual.setReviewerEmpNo(manual.getReviewerEmpNo());
        existingManual.setApproverEmpNo(manual.getApproverEmpNo());
        existingManual.setUpdatedId(manual.getUpdatedId());

        InternalControlManual savedManual = internalControlManualRepository.save(existingManual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_UPDATED,
                "내부통제 업무메뉴얼이 수정되었습니다.",
                savedManual.getUpdatedId(),
                null, // actorName
                savedManual.getManualId()
        );
        handoverHistoryRepository.save(history);

        log.debug("내부통제 메뉴얼 수정 완료 - manualId: {}", savedManual.getManualId());
        return savedManual;
    }

    @Override
    public Optional<InternalControlManual> getManual(Long manualId) {
        return internalControlManualRepository.findById(manualId);
    }

    @Override
    @Transactional
    public void deleteManual(Long manualId) {
        log.debug("내부통제 메뉴얼 삭제 시작 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 발행된 메뉴얼은 삭제 불가
        if (manual.getStatus() == InternalControlManual.ManualStatus.PUBLISHED) {
            throw new BusinessException("발행된 내부통제 업무메뉴얼은 삭제할 수 없습니다.");
        }

        internalControlManualRepository.delete(manual);

        log.debug("내부통제 메뉴얼 삭제 완료 - manualId: {}", manualId);
    }

    @Override
    public Page<InternalControlManual> getAllManuals(Pageable pageable) {
        return internalControlManualRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void submitForReview(Long manualId, String actorEmpNo) {
        log.debug("내부통제 메뉴얼 검토 제출 시작 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 초안 상태에서만 검토 제출 가능
        if (manual.getStatus() != InternalControlManual.ManualStatus.DRAFT) {
            throw new BusinessException("초안 상태의 메뉴얼만 검토 제출할 수 있습니다.");
        }

        manual.submitForReview();
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_SUBMITTED,
                "내부통제 업무메뉴얼이 검토 제출되었습니다.",
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("내부통제 메뉴얼 검토 제출 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void publishManual(Long manualId, String actorEmpNo) {
        log.debug("내부통제 메뉴얼 발행 시작 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 승인된 메뉴얼만 발행 가능
        if (manual.getStatus() != InternalControlManual.ManualStatus.APPROVED) {
            throw new BusinessException("승인된 메뉴얼만 발행할 수 있습니다.");
        }

        manual.publish();
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_PUBLISHED,
                "내부통제 업무메뉴얼이 발행되었습니다.",
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("내부통제 메뉴얼 발행 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void revertToDraft(Long manualId, String actorEmpNo, String reason) {
        log.debug("내부통제 메뉴얼 초안으로 되돌리기 시작 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 발행된 메뉴얼은 되돌릴 수 없음
        if (manual.getStatus() == InternalControlManual.ManualStatus.PUBLISHED) {
            throw new BusinessException("발행된 메뉴얼은 초안으로 되돌릴 수 없습니다.");
        }

        manual.revertToDraft();
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_REVERTED,
                "내부통제 업무메뉴얼이 초안으로 되돌아갔습니다. 사유: " + reason,
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("내부통제 메뉴얼 초안으로 되돌리기 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public InternalControlManual updateVersion(Long manualId, String newVersion, String actorEmpNo) {
        log.debug("내부통제 메뉴얼 버전 업데이트 시작 - manualId: {}, newVersion: {}", manualId, newVersion);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 발행된 메뉴얼만 버전 업데이트 가능
        if (manual.getStatus() != InternalControlManual.ManualStatus.PUBLISHED) {
            throw new BusinessException("발행된 메뉴얼만 버전 업데이트할 수 있습니다.");
        }

        manual.updateVersion(newVersion);
        manual.setUpdatedId(actorEmpNo);
        InternalControlManual savedManual = internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_VERSION_UPDATED,
                "내부통제 업무메뉴얼 버전이 업데이트되었습니다. 새 버전: " + newVersion,
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("내부통제 메뉴얼 버전 업데이트 완료 - manualId: {}, newVersion: {}", manualId, newVersion);
        return savedManual;
    }

    @Override
    public List<InternalControlManualDto> getManualsByDepartment(String deptCd) {
        List<InternalControlManual> manuals = internalControlManualRepository.findByDeptCd(deptCd);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsByStatus(InternalControlManual.ManualStatus status) {
        List<InternalControlManual> manuals = internalControlManualRepository.findByStatus(status);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsByAuthor(String authorEmpNo) {
        List<InternalControlManual> manuals = internalControlManualRepository.findByAuthorEmpNo(authorEmpNo);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getLatestPublishedManuals(String deptCd) {
        List<InternalControlManual> manuals = internalControlManualRepository.findLatestPublishedByDept(deptCd);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getValidManuals() {
        List<InternalControlManual> manuals = internalControlManualRepository.findValidManuals(LocalDate.now());
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getExpiringManuals(int daysFromNow) {
        LocalDate targetDate = LocalDate.now().plusDays(daysFromNow);
        List<InternalControlManual> manuals = internalControlManualRepository.findExpiringManuals(targetDate);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getPendingApprovalManuals() {
        List<InternalControlManual> manuals = internalControlManualRepository.findPendingApprovalManuals();
        return convertToDto(manuals);
    }

    @Override
    public Page<InternalControlManualDto> searchManuals(org.itcen.domain.handover.dto.ManualSearchDto searchDto, Pageable pageable) {
        Page<InternalControlManual> manuals = internalControlManualRepository.searchManuals(
            searchDto.getDeptCd(),
            searchDto.getStatus(),
            searchDto.getManualTitle(),
            searchDto.getAuthorEmpNo(),
            searchDto.getManualVersion(),
            searchDto.getEffectiveDate(),
            searchDto.getExpiryDate(),
            pageable
        );
        
        return manuals.map(this::convertToDto);
    }

    @Override
    public ManualStatisticsDto getManualStatistics() {
        // TODO: 통계 로직 구현
        return new ManualStatisticsDto() {
            @Override
            public Long getTotalManuals() { return 0L; }
            @Override
            public Long getDraftManuals() { return 0L; }
            @Override
            public Long getPublishedManuals() { return 0L; }
            @Override
            public Long getExpiringManuals() { return 0L; }
            @Override
            public Double getApprovalRate() { return 0.0; }
        };
    }

    @Override
    public List<DepartmentStatisticsDto> getManualStatisticsByDepartment() {
        // TODO: 부서별 통계 로직 구현
        return List.of();
    }

    @Override
    public List<CategoryStatisticsDto> getManualStatisticsByCategory() {
        // TODO: 카테고리별 통계 로직 구현
        return List.of();
    }

    @Override
    public List<MonthlyStatisticsDto> getMonthlyCreationStatistics() {
        // TODO: 월별 생성 통계 로직 구현
        return List.of();
    }

    private List<InternalControlManualDto> convertToDto(List<InternalControlManual> manuals) {
        return manuals.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private InternalControlManualDto convertToDto(InternalControlManual manual) {
        return new InternalControlManualDto() {
            @Override
            public Long getManualId() { return manual.getManualId(); }

            @Override
            public String getDeptCd() { return manual.getDeptCd(); }

            @Override
            public String getDeptName() { return null; } // TODO: Department 조인 후 구현

            @Override
            public String getManualTitle() { return manual.getManualTitle(); }

            @Override
            public String getManualVersion() { return manual.getManualVersion(); }

            @Override
            public String getManualContent() { return manual.getManualContent(); }

            @Override
            public InternalControlManual.ManualStatus getStatus() { return manual.getStatus(); }

            @Override
            public Long getApprovalId() { return manual.getApprovalId(); }

            @Override
            public LocalDate getEffectiveDate() { return manual.getEffectiveDate(); }

            @Override
            public LocalDate getExpiryDate() { return manual.getExpiryDate(); }

            @Override
            public String getAuthorEmpNo() { return manual.getAuthorEmpNo(); }

            @Override
            public String getAuthorName() { return null; } // TODO: User 조인 후 구현

            @Override
            public String getReviewerEmpNo() { return manual.getReviewerEmpNo(); }

            @Override
            public String getReviewerName() { return null; } // TODO: User 조인 후 구현

            @Override
            public String getApproverEmpNo() { return manual.getApproverEmpNo(); }

            @Override
            public String getApproverName() { return null; } // TODO: User 조인 후 구현
        };
    }
}