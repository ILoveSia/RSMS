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

        // 같은 부서의 같은 내부통제 항목에 대한 초안 상태의 메뉴얼이 있는지 확인
        List<InternalControlManual> existingDrafts = internalControlManualRepository
                .findByDeptCdAndHodIcItemIdAndStatus(manual.getDeptCd(), 
                                                    manual.getHodIcItemId(), 
                                                    InternalControlManual.ManualStatus.DRAFT);
        
        if (!existingDrafts.isEmpty()) {
            throw new BusinessException("해당 부서의 내부통제 항목에 이미 초안 상태의 메뉴얼이 있습니다.");
        }

        // 검토 주기가 설정된 경우 다음 검토일 계산
        if (manual.getReviewCycleMonths() != null && manual.getReviewCycleMonths() > 0) {
            manual.calculateNextReviewDate();
        }

        InternalControlManual savedManual = internalControlManualRepository.save(manual);

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
        existingManual.setManualDescription(manual.getManualDescription());
        existingManual.setManualContent(manual.getManualContent());
        existingManual.setManualCategory(manual.getManualCategory());
        existingManual.setIcTaskCategory(manual.getIcTaskCategory());
        existingManual.setManualVersion(manual.getManualVersion());
        existingManual.setUpdatedId(manual.getUpdatedId());

        // 검토 주기가 변경된 경우 다음 검토일 재계산
        if (manual.getReviewCycleMonths() != null && 
            !manual.getReviewCycleMonths().equals(existingManual.getReviewCycleMonths())) {
            existingManual.setReviewCycleMonths(manual.getReviewCycleMonths());
            existingManual.calculateNextReviewDate();
        }

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

        log.debug("내부통제 메뉴얼 수정 완료 - manualId: {}", manualId);
        return savedManual;
    }

    @Override
    public Optional<InternalControlManual> getManual(Long manualId) {
        log.debug("내부통제 메뉴얼 조회 - manualId: {}", manualId);
        return internalControlManualRepository.findById(manualId);
    }

    @Override
    @Transactional
    public void deleteManual(Long manualId) {
        log.debug("내부통제 메뉴얼 삭제 시작 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 삭제 가능 여부 확인 (승인되었거나 발행된 메뉴얼은 삭제 불가)
        if (manual.getStatus() == InternalControlManual.ManualStatus.APPROVED ||
            manual.getStatus() == InternalControlManual.ManualStatus.PUBLISHED) {
            throw new BusinessException("승인되었거나 발행된 내부통제 업무메뉴얼은 삭제할 수 없습니다.");
        }

        internalControlManualRepository.delete(manual);
        log.debug("내부통제 메뉴얼 삭제 완료 - manualId: {}", manualId);
    }

    @Override
    public Page<InternalControlManual> getAllManuals(Pageable pageable) {
        log.debug("모든 내부통제 메뉴얼 조회 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return internalControlManualRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void submitForReview(Long manualId, String hodEmpNo, String actorEmpNo) {
        log.debug("부서장 검토 제출 - manualId: {}, hodEmpNo: {}", manualId, hodEmpNo);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 제출 가능 여부 확인
        if (manual.getStatus() != InternalControlManual.ManualStatus.DRAFT) {
            throw new BusinessException("초안 상태의 메뉴얼만 검토에 제출할 수 있습니다.");
        }

        manual.submitForReview(hodEmpNo);
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_UPDATED,
                "내부통제 업무메뉴얼이 부서장 검토에 제출되었습니다.",
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("부서장 검토 제출 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void approveByHod(Long manualId, String actorEmpNo) {
        log.debug("부서장 승인 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 승인 가능 여부 확인
        if (manual.getStatus() != InternalControlManual.ManualStatus.REVIEW) {
            throw new BusinessException("부서장 검토 중인 메뉴얼만 승인할 수 있습니다.");
        }

        manual.approveByHod();
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_APPROVED,
                "내부통제 업무메뉴얼이 부서장에 의해 승인되었습니다.",
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("부서장 승인 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void publishManual(Long manualId, String actorEmpNo) {
        log.debug("메뉴얼 발행 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 발행 가능 여부 확인
        if (manual.getStatus() != InternalControlManual.ManualStatus.APPROVED) {
            throw new BusinessException("부서장 승인된 메뉴얼만 발행할 수 있습니다.");
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

        log.debug("메뉴얼 발행 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void revertToDraft(Long manualId, String actorEmpNo, String reason) {
        log.debug("초안 되돌리기 - manualId: {}, reason: {}", manualId, reason);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // 되돌리기 가능 여부 확인
        if (manual.getStatus() == InternalControlManual.ManualStatus.PUBLISHED) {
            throw new BusinessException("발행된 메뉴얼은 초안으로 되돌릴 수 없습니다.");
        }

        manual.revertToDraft();
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.STATUS_CHANGED,
                "내부통제 업무메뉴얼이 초안으로 되돌려졌습니다. 사유: " + (reason != null ? reason : "사유 없음"),
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("초안 되돌리기 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public InternalControlManual updateVersion(Long manualId, String newVersion, String actorEmpNo) {
        log.debug("버전 업데이트 - manualId: {}, newVersion: {}", manualId, newVersion);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        String oldVersion = manual.getManualVersion();
        manual.setManualVersion(newVersion);
        manual.setUpdatedId(actorEmpNo);
        InternalControlManual savedManual = internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_UPDATED,
                String.format("메뉴얼 버전이 업데이트되었습니다. (%s → %s)", oldVersion, newVersion),
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("버전 업데이트 완료 - manualId: {}, newVersion: {}", manualId, newVersion);
        return savedManual;
    }

    @Override
    @Transactional
    public void updateReviewCycle(Long manualId, Integer months, String actorEmpNo) {
        log.debug("검토 주기 업데이트 - manualId: {}, months: {}", manualId, months);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        Integer oldCycle = manual.getReviewCycleMonths();
        manual.setReviewCycleMonths(months);
        manual.calculateNextReviewDate();
        manual.setUpdatedId(actorEmpNo);
        internalControlManualRepository.save(manual);

        // 이력 생성
        HandoverHistory history = HandoverHistory.createManualHistory(
                1L, // assignmentId - 기본값 설정
                HandoverHistory.ActivityType.DOCUMENT_UPDATED,
                String.format("검토 주기가 업데이트되었습니다. (%d개월 → %d개월)", 
                             oldCycle != null ? oldCycle : 0, months),
                actorEmpNo,
                null, // actorName
                manualId
        );
        handoverHistoryRepository.save(history);

        log.debug("검토 주기 업데이트 완료 - manualId: {}, months: {}", manualId, months);
    }

    // 조회 메서드들

    @Override
    public List<InternalControlManualDto> getManualsByDepartment(String deptCd) {
        log.debug("부서별 내부통제 메뉴얼 조회 - deptCd: {}", deptCd);
        List<InternalControlManual> manuals = internalControlManualRepository.findByDeptCd(deptCd);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsByStatus(InternalControlManual.ManualStatus status) {
        log.debug("상태별 내부통제 메뉴얼 조회 - status: {}", status);
        List<InternalControlManual> manuals = internalControlManualRepository.findByStatus(status);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsByAuthor(String authorEmpNo) {
        log.debug("작성자별 내부통제 메뉴얼 조회 - authorEmpNo: {}", authorEmpNo);
        List<InternalControlManual> manuals = internalControlManualRepository.findByAuthorEmpNo(authorEmpNo);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsByHod(String hodEmpNo) {
        log.debug("부서장별 내부통제 메뉴얼 조회 - hodEmpNo: {}", hodEmpNo);
        List<InternalControlManual> manuals = internalControlManualRepository.findByHodEmpNo(hodEmpNo);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsByCategory(String category) {
        log.debug("분류별 내부통제 메뉴얼 조회 - category: {}", category);
        List<InternalControlManual> manuals = internalControlManualRepository.findByManualCategory(category);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getLatestPublishedManuals(String deptCd) {
        log.debug("부서의 최신 발행 메뉴얼 조회 - deptCd: {}", deptCd);
        List<InternalControlManual> manuals = internalControlManualRepository.findLatestPublishedByDepartment(deptCd);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getValidManuals() {
        log.debug("유효한 메뉴얼 조회");
        List<InternalControlManual> manuals = internalControlManualRepository.findValidManuals(LocalDate.now());
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getExpiringManuals(int daysFromNow) {
        log.debug("만료 예정 메뉴얼 조회 - daysFromNow: {}", daysFromNow);
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(daysFromNow);
        List<InternalControlManual> manuals = internalControlManualRepository.findExpiringManuals(startDate, endDate);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getManualsNeedingReview() {
        log.debug("검토 필요 메뉴얼 조회");
        List<InternalControlManual> manuals = internalControlManualRepository.findManualsNeedingReview(LocalDate.now());
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getPendingApprovalManuals() {
        log.debug("승인 대기중인 메뉴얼 조회");
        List<InternalControlManual> manuals = internalControlManualRepository.findPendingApprovalManuals();
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getPendingApprovalByHod(String hodEmpNo) {
        log.debug("부서장 승인 대기중인 메뉴얼 조회 - hodEmpNo: {}", hodEmpNo);
        List<InternalControlManual> manuals = internalControlManualRepository.findPendingApprovalByHod(hodEmpNo);
        return convertToDto(manuals);
    }

    @Override
    public Page<InternalControlManualDto> searchManuals(ManualSearchDto searchDto, Pageable pageable) {
        log.debug("복합 조건 검색 - searchDto: {}", searchDto);
        
        Page<InternalControlManual> manuals = internalControlManualRepository.findBySearchCriteria(
                searchDto.getDeptCd(),
                searchDto.getStatus(),
                searchDto.getManualCategory(),
                searchDto.getAuthorEmpNo(),
                searchDto.getManualTitle(),
                pageable
        );
        
        return manuals.map(this::convertToDto);
    }

    // 통계 기능들은 추후 구현 예정
    @Override
    public ManualStatisticsDto getManualStatistics() {
        // TODO: 구현 예정
        return null;
    }

    @Override
    public List<DepartmentStatisticsDto> getManualStatisticsByDepartment() {
        // TODO: 구현 예정
        return null;
    }

    @Override
    public List<CategoryStatisticsDto> getManualStatisticsByCategory() {
        // TODO: 구현 예정
        return null;
    }

    @Override
    public List<MonthlyStatisticsDto> getMonthlyCreationStatistics() {
        // TODO: 구현 예정
        return null;
    }

    // Private helper methods

    private List<InternalControlManualDto> convertToDto(List<InternalControlManual> manuals) {
        return manuals.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
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
            public Long getHodIcItemId() { return manual.getHodIcItemId(); }
            
            @Override
            public String getManualTitle() { return manual.getManualTitle(); }
            
            @Override
            public String getManualVersion() { return manual.getManualVersion(); }
            
            @Override
            public String getManualDescription() { return manual.getManualDescription(); }
            
            @Override
            public String getManualContent() { return manual.getManualContent(); }
            
            @Override
            public String getManualCategory() { return manual.getManualCategory(); }
            
            @Override
            public String getIcTaskCategory() { return manual.getIcTaskCategory(); }
            
            @Override
            public InternalControlManual.ManualStatus getStatus() { return manual.getStatus(); }
            
            @Override
            public Long getApprovalId() { return manual.getApprovalId(); }
            
            @Override
            public LocalDate getEffectiveDate() { return manual.getEffectiveDate(); }
            
            @Override
            public LocalDate getExpiryDate() { return manual.getExpiryDate(); }
            
            @Override
            public Integer getReviewCycleMonths() { return manual.getReviewCycleMonths(); }
            
            @Override
            public LocalDate getNextReviewDate() { return manual.getNextReviewDate(); }
            
            @Override
            public String getAuthorEmpNo() { return manual.getAuthorEmpNo(); }
            
            @Override
            public String getAuthorName() { return null; } // TODO: User 조인 후 구현
            
            @Override
            public String getHodEmpNo() { return manual.getHodEmpNo(); }
            
            @Override
            public String getHodName() { return null; } // TODO: User 조인 후 구현
        };
    }
}