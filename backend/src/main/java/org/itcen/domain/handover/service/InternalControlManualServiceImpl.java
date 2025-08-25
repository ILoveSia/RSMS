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
            .deptCd(manual.getDeptCd())
            .authorEmpNo(manual.getAuthorEmpNo())
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

        // 필드 업데이트 (status 컬럼 삭제되어 상태 확인 로직 제거)
        existingManual.setManualTitle(manual.getManualTitle());
        existingManual.setManualContent(manual.getManualContent());
        existingManual.setManualVersion(manual.getManualVersion());
        existingManual.setDeptCd(manual.getDeptCd());
        existingManual.setEffectiveDate(manual.getEffectiveDate());
        existingManual.setExpiryDate(manual.getExpiryDate());
        existingManual.setAuthorEmpNo(manual.getAuthorEmpNo());
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

        // status 컬럼 삭제되어 상태 확인 로직 제거

        internalControlManualRepository.delete(manual);

        log.debug("내부통제 메뉴얼 삭제 완료 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void submitForReview(Long manualId, String actorEmpNo) {
        log.debug("내부통제 메뉴얼 검토 제출 시작 - manualId: {}", manualId);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // status 컬럼 삭제되어 상태 확인 로직 제거
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

        // status 컬럼 삭제되어 상태 확인 로직 제거
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
    public InternalControlManual updateVersion(Long manualId, String newVersion, String actorEmpNo) {
        log.debug("내부통제 메뉴얼 버전 업데이트 시작 - manualId: {}, newVersion: {}", manualId, newVersion);

        InternalControlManual manual = internalControlManualRepository.findById(manualId)
                .orElseThrow(() -> new BusinessException("내부통제 업무메뉴얼을 찾을 수 없습니다: " + manualId));

        // status 컬럼 삭제되어 상태 확인 로직 제거
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
    public List<InternalControlManualDto> getManualsByAuthor(String authorEmpNo) {
        List<InternalControlManual> manuals = internalControlManualRepository.findByAuthorEmpNo(authorEmpNo);
        return convertToDto(manuals);
    }

    @Override
    public List<InternalControlManualDto> getValidManuals() {
        List<InternalControlManual> manuals = internalControlManualRepository.findValidManuals(LocalDate.now());
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
            searchDto.getManualTitle(),
            searchDto.getAuthorEmpNo(),
            searchDto.getManualVersion(),
            searchDto.getEffectiveDate(),
            searchDto.getExpiryDate(),
            pageable
        );
        
        return manuals.map(this::convertToDto);
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

            // status, approval_id 컬럼 삭제됨

            @Override
            public LocalDate getEffectiveDate() { return manual.getEffectiveDate(); }

            @Override
            public LocalDate getExpiryDate() { return manual.getExpiryDate(); }

            @Override
            public String getAuthorEmpNo() { return manual.getAuthorEmpNo(); }

            // reviewer_emp_no, approver_emp_no 컬럼 삭제됨
        };
    }

    // 결재 연동 메서드들

    @Override
    public Page<InternalControlManualService.InternalControlManualWithApprovalDto> searchManualsWithApproval(
            org.itcen.domain.handover.dto.ManualSearchDto searchDto, Pageable pageable) {
        log.info("결재 연동 검색 - searchDto: {}", searchDto);
        log.info("Repository 호출 파라미터 - deptCd: '{}', authorEmpNo: '{}', manualTitle: '{}'", 
                searchDto.getDeptCd(), searchDto.getAuthorEmpNo(), searchDto.getManualTitle());

        // Native Query로 approval 테이블과 조인해서 데이터 조회
        Page<Object[]> results = internalControlManualRepository.findBySearchCriteriaWithApproval(
                searchDto.getDeptCd(),
                searchDto.getAuthorEmpNo(),
                searchDto.getManualTitle(),
                pageable
        );

        log.info("검색 결과 개수: {}", results.getTotalElements());
        return results.map(this::convertObjectArrayToApprovalDto);
    }

    @Override
    @Transactional
    public void startApproval(Long manualId, org.itcen.domain.handover.dto.ApprovalStartRequestDto request) {
        log.debug("결재 요청 시작 - manualId: {}, taskType: {}", manualId, request.getTaskTypeCode());

        Optional<InternalControlManual> manualOpt = internalControlManualRepository.findById(manualId);
        if (manualOpt.isEmpty()) {
            throw new BusinessException("메뉴얼을 찾을 수 없습니다. manualId: " + manualId);
        }

        InternalControlManual manual = manualOpt.get();
        
        // 결재 요청 가능성 기본 확인

        // TODO: 실제 구현에서는 approval 테이블에 레코드 생성 필요
        // 현재는 로그만 출력
        log.info("결재 요청 생성됨 - manualId: {}, title: {}", manualId, request.getTitle());
    }

    @Override
    @Transactional
    public void approveApproval(Long manualId, String comment) {
        log.debug("결재 승인 - manualId: {}, comment: {}", manualId, comment);

        // TODO: 실제 구현에서는 approval 테이블 업데이트 및 다음 단계 처리 필요
        log.info("결재 승인 처리됨 - manualId: {}", manualId);
    }

    @Override
    @Transactional
    public void rejectApproval(Long manualId, String reason) {
        log.debug("결재 반려 - manualId: {}, reason: {}", manualId, reason);

        // TODO: 실제 구현에서는 approval 테이블 업데이트 및 메뉴얼 상태 변경 필요
        log.info("결재 반려 처리됨 - manualId: {}, reason: {}", manualId, reason);
    }

    @Override
    @Transactional
    public void cancelApproval(Long manualId) {
        log.debug("결재 취소 - manualId: {}", manualId);

        // TODO: 실제 구현에서는 approval 테이블 상태 변경 필요
        log.info("결재 취소됨 - manualId: {}", manualId);
    }

    /**
     * Native Query 결과를 InternalControlManualWithApprovalDto로 변환
     */
    private InternalControlManualWithApprovalDto convertObjectArrayToApprovalDto(Object[] row) {
        // 디버깅을 위한 로깅 추가
        log.info("Converting Object Array to DTO. Array length: {}", row.length);
        for (int i = 0; i < row.length; i++) {
            log.info("row[{}] = {} (type: {})", i, row[i], row[i] != null ? row[i].getClass().getName() : "null");
        }
        
        return new InternalControlManualWithApprovalDto() {
            @Override
            public Long getManualId() { 
                return safeLongValue(row[0]); 
            }

            @Override
            public String getDeptCd() { 
                return safeStringValue(row[1]); 
            }

            @Override
            public String getDeptName() { 
                return safeStringValue(row[2]); // d.dept_name (인덱스 2)
            }

            @Override
            public String getManualTitle() { 
                return safeStringValue(row[3]); // icm.manual_title (인덱스 3)
            }

            @Override
            public String getManualVersion() { 
                return safeStringValue(row[4]); // icm.manual_version (인덱스 4)
            }

            @Override
            public String getManualContent() { 
                return safeStringValue(row[5]); // icm.manual_content (인덱스 5)
            }

            @Override
            public LocalDate getEffectiveDate() { 
                return safeDateValue(row[6]); // icm.effective_date (인덱스 6)
            }

            @Override
            public LocalDate getExpiryDate() { 
                return safeDateValue(row[7]); // icm.expiry_date (인덱스 7)
            }

            @Override
            public String getAuthorEmpNo() { 
                return safeStringValue(row[8]); // icm.author_emp_no (인덱스 8)
            }

            
            // 감사 필드
            @Override
            public LocalDate getCreatedAt() {
                return safeTimestampValue(row[10]); // icm.created_at (인덱스 10)
            }

            @Override
            public LocalDate getUpdatedAt() {
                return safeTimestampValue(row[11]); // icm.updated_at (인덱스 11)
            }

            @Override
            public String getCreatedId() {
                return safeStringValue(row[12]); // icm.created_id (인덱스 12)
            }

            @Override
            public String getUpdatedId() {
                return safeStringValue(row[13]); // icm.updated_id (인덱스 13)
            }
            
            @Override
            public Long getAttachmentCount() { 
                return safeLongValue(row[19]); // attachment_count (인덱스 19)
            }

            @Override
            public List<AttachmentInfo> getAttachments() { return List.of(); }

            // 결재 관련 필드 
            @Override
            public String getApprovalStatus() {
                String status = safeStringValue(row[14]); // approval_status (인덱스 14)
                return status != null ? status : "NONE";
            }

            @Override
            public Long getApprovalId() { 
                return safeLongValue(row[15]); // ap.approval_id (인덱스 15)
            }

            @Override
            public String getRequesterId() { 
                return safeStringValue(row[16]); // ap.requester_id (인덱스 16)
            }

            @Override
            public String getRequesterName() { return null; }

            @Override
            public String getCurrentApproverId() { 
                return safeStringValue(row[17]); // ap.approver_id (인덱스 17)
            }

            @Override
            public String getCurrentApproverName() { return null; }

            @Override
            public LocalDate getApprovedAt() { 
                return safeTimestampValue(row[18]); // ap.approval_datetime (인덱스 18)
            }

            @Override
            public LocalDate getRejectedAt() { 
                if ("REJECTED".equals(getApprovalStatus())) {
                    return safeTimestampValue(row[18]); // ap.approval_datetime (인덱스 18)
                }
                return null; 
            }

            @Override
            public String getRejectionReason() { 
                // 추후 comments 필드를 쿼리에 추가할 수 있음
                return null; 
            }
        };
    }

    // 안전한 타입 변환 헬퍼 메서드들
    private String safeStringValue(Object obj) {
        return obj != null ? obj.toString() : null;
    }

    private Long safeLongValue(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        }
        if (obj instanceof String) {
            try {
                return Long.valueOf((String) obj);
            } catch (NumberFormatException e) {
                log.warn("Cannot convert string to Long: {}", obj);
                return null;
            }
        }
        log.warn("Unexpected type for Long conversion: {} ({})", obj, obj.getClass().getName());
        return null;
    }

    private LocalDate safeDateValue(Object obj) {
        if (obj == null) return null;
        if (obj instanceof java.sql.Date) {
            return ((java.sql.Date) obj).toLocalDate();
        }
        if (obj instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) obj).toLocalDateTime().toLocalDate();
        }
        log.warn("Unexpected type for Date conversion: {} ({})", obj, obj.getClass().getName());
        return null;
    }

    private LocalDate safeTimestampValue(Object obj) {
        if (obj == null) return null;
        if (obj instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) obj).toLocalDateTime().toLocalDate();
        }
        if (obj instanceof java.sql.Date) {
            return ((java.sql.Date) obj).toLocalDate();
        }
        log.warn("Unexpected type for Timestamp conversion: {} ({})", obj, obj.getClass().getName());
        return null;
    }
}