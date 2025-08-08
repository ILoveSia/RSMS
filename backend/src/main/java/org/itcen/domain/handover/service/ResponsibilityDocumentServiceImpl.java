package org.itcen.domain.handover.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.handover.dto.DocumentSearchDto;
import org.itcen.domain.handover.entity.ResponsibilityDocument;
import org.itcen.domain.handover.repository.ResponsibilityDocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 책무기술서 서비스 구현체
 * 책무기술서 관련 비즈니스 로직을 구현합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 비즈니스 로직만 담당
 * - Open/Closed: 새로운 문서 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: ResponsibilityDocumentService 인터페이스 준수
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponsibilityDocumentServiceImpl implements ResponsibilityDocumentService {

    private final ResponsibilityDocumentRepository responsibilityDocumentRepository;

    @Override
    @Transactional
    public ResponsibilityDocument createDocument(ResponsibilityDocument document) {
        log.debug("책무기술서 생성 시작 - title: {}",
                  document.getDocumentTitle());

        ResponsibilityDocument savedDocument = responsibilityDocumentRepository.save(document);

        log.debug("책무기술서 생성 완료 - documentId: {}", savedDocument.getDocumentId());
        return savedDocument;
    }

    @Override
    @Transactional
    public ResponsibilityDocument updateDocument(Long documentId, ResponsibilityDocument document) {
        log.debug("책무기술서 수정 시작 - documentId: {}", documentId);

        ResponsibilityDocument existingDocument = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        // 수정 가능 여부 확인 (발행된 문서는 수정 불가)
        if (existingDocument.getStatus() == ResponsibilityDocument.DocumentStatus.PUBLISHED) {
            throw new BusinessException("발행된 책무기술서는 수정할 수 없습니다.");
        }

        // 필드 업데이트
        existingDocument.setDocumentTitle(document.getDocumentTitle());
        existingDocument.setDocumentContent(document.getDocumentContent());
        existingDocument.setDocumentVersion(document.getDocumentVersion());
        existingDocument.setEffectiveDate(document.getEffectiveDate());
        existingDocument.setExpiryDate(document.getExpiryDate());
        existingDocument.setStatus(document.getStatus());
        existingDocument.setUpdatedId(document.getUpdatedId());

        ResponsibilityDocument savedDocument = responsibilityDocumentRepository.save(existingDocument);

        log.debug("책무기술서 수정 완료 - documentId: {}", documentId);
        return savedDocument;
    }

    @Override
    public Optional<ResponsibilityDocument> getDocument(Long documentId) {
        log.debug("책무기술서 조회 - documentId: {}", documentId);
        return responsibilityDocumentRepository.findById(documentId);
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId) {
        log.debug("책무기술서 삭제 시작 - documentId: {}", documentId);

        ResponsibilityDocument document = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        // 삭제 가능 여부 확인 (승인되었거나 발행된 문서는 삭제 불가)
        if (document.getStatus() == ResponsibilityDocument.DocumentStatus.APPROVED ||
            document.getStatus() == ResponsibilityDocument.DocumentStatus.PUBLISHED) {
            throw new BusinessException("승인되었거나 발행된 책무기술서는 삭제할 수 없습니다.");
        }

        responsibilityDocumentRepository.delete(document);
        log.debug("책무기술서 삭제 완료 - documentId: {}", documentId);
    }

    @Override
    public Page<ResponsibilityDocument> getAllDocuments(Pageable pageable) {
        log.debug("모든 책무기술서 조회 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return responsibilityDocumentRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void submitForReview(Long documentId, String reviewerEmpNo, String actorEmpNo) {
        log.debug("검토 제출 - documentId: {}, reviewerEmpNo: {}", documentId, reviewerEmpNo);

        ResponsibilityDocument document = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        // 제출 가능 여부 확인
        if (document.getStatus() != ResponsibilityDocument.DocumentStatus.DRAFT) {
            throw new BusinessException("초안 상태의 문서만 검토에 제출할 수 있습니다.");
        }

        document.submitForReview(reviewerEmpNo);
        document.setUpdatedId(actorEmpNo);
        responsibilityDocumentRepository.save(document);

        log.debug("검토 제출 완료 - documentId: {}", documentId);
    }

    @Override
    @Transactional
    public void approveDocument(Long documentId, String approverEmpNo, String actorEmpNo) {
        log.debug("문서 승인 - documentId: {}, approverEmpNo: {}", documentId, approverEmpNo);

        ResponsibilityDocument document = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        // 승인 가능 여부 확인
        if (document.getStatus() != ResponsibilityDocument.DocumentStatus.REVIEW) {
            throw new BusinessException("검토 중인 문서만 승인할 수 있습니다.");
        }

        document.approve(approverEmpNo);
        document.setUpdatedId(actorEmpNo);
        responsibilityDocumentRepository.save(document);

        log.debug("문서 승인 완료 - documentId: {}", documentId);
    }

    @Override
    @Transactional
    public void publishDocument(Long documentId, String actorEmpNo) {
        log.debug("문서 발행 - documentId: {}", documentId);

        ResponsibilityDocument document = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        // 발행 가능 여부 확인
        if (document.getStatus() != ResponsibilityDocument.DocumentStatus.APPROVED) {
            throw new BusinessException("승인된 문서만 발행할 수 있습니다.");
        }

        document.publish();
        document.setUpdatedId(actorEmpNo);
        responsibilityDocumentRepository.save(document);

        log.debug("문서 발행 완료 - documentId: {}", documentId);
    }

    @Override
    @Transactional
    public void revertToDraft(Long documentId, String actorEmpNo, String reason) {
        log.debug("초안 되돌리기 - documentId: {}, reason: {}", documentId, reason);

        ResponsibilityDocument document = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        // 되돌리기 가능 여부 확인
        if (document.getStatus() == ResponsibilityDocument.DocumentStatus.PUBLISHED) {
            throw new BusinessException("발행된 문서는 초안으로 되돌릴 수 없습니다.");
        }

        document.revertToDraft();
        document.setUpdatedId(actorEmpNo);
        responsibilityDocumentRepository.save(document);

        log.debug("초안 되돌리기 완료 - documentId: {}", documentId);
    }

    @Override
    @Transactional
    public ResponsibilityDocument updateVersion(Long documentId, String newVersion, String actorEmpNo) {
        log.debug("버전 업데이트 - documentId: {}, newVersion: {}", documentId, newVersion);

        ResponsibilityDocument document = responsibilityDocumentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException("책무기술서를 찾을 수 없습니다: " + documentId));

        String oldVersion = document.getDocumentVersion();
        document.setDocumentVersion(newVersion);
        document.setUpdatedId(actorEmpNo);
        ResponsibilityDocument savedDocument = responsibilityDocumentRepository.save(document);

        log.debug("버전 업데이트 완료 - documentId: {}, newVersion: {}", documentId, newVersion);
        return savedDocument;
    }

    // 조회 메서드들

    // @Override
    // public List<ResponsibilityDocumentDto> getDocumentsByPosition(Long positionId) {
    //     log.debug("직책별 책무기술서 조회 - positionId: {}", positionId);
    //     List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findByResponsibilityId(positionId);
    //     return convertToDto(documents);
    // }

    @Override
    public List<ResponsibilityDocumentDto> getDocumentsByStatus(ResponsibilityDocument.DocumentStatus status) {
        log.debug("상태별 책무기술서 조회 - status: {}", status);
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findByStatusWithJoin(status);
        return convertToDto(documents);
    }

    @Override
    public List<ResponsibilityDocumentDto> getDocumentsByAuthor(String authorEmpNo) {
        log.debug("작성자별 책무기술서 조회 - authorEmpNo: {}", authorEmpNo);
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findByAuthorEmpNoWithJoin(authorEmpNo);
        return convertToDto(documents);
    }

    @Override
    public Optional<ResponsibilityDocumentDto> getLatestPublishedDocument(Long positionId) {
        log.debug("최신 발행 문서 조회 - positionId: {}", positionId);
        Optional<ResponsibilityDocument> document = responsibilityDocumentRepository.findLatestPublishedByPositionId();
        return document.map(this::convertToDto);
    }

    @Override
    public List<ResponsibilityDocumentDto> getValidDocuments() {
        log.debug("유효한 문서 조회");
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findValidDocuments(LocalDate.now());
        return convertToDto(documents);
    }

    @Override
    public List<ResponsibilityDocumentDto> getExpiringDocuments(int daysFromNow) {
        log.debug("만료 예정 문서 조회 - daysFromNow: {}", daysFromNow);
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(daysFromNow);
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findExpiringDocuments(startDate, endDate);
        return convertToDto(documents);
    }

    @Override
    public List<ResponsibilityDocumentDto> getPendingApprovalDocuments() {
        log.debug("승인 대기 문서 조회");
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findPendingApprovalDocuments();
        return convertToDto(documents);
    }

    @Override
    public Page<ResponsibilityDocumentDto> searchDocuments(DocumentSearchDto searchDto, Pageable pageable) {
        log.debug("복합 조건 검색 - searchDto: {}", searchDto);

        Page<ResponsibilityDocument> results = responsibilityDocumentRepository.findBySearchCriteriaWithJoin(
                searchDto.getStatus(),
                searchDto.getAuthorEmpNo(),
                searchDto.getDocumentTitle(),
                pageable
        );

        return results.map(this::convertToDtoWithJoin);
    }

    // 통계 기능들은 추후 구현 예정
    @Override
    public DocumentStatisticsDto getDocumentStatistics() {
        // TODO: 구현 예정
        return null;
    }

    @Override
    public List<MonthlyStatisticsDto> getMonthlyCreationStatistics() {
        // TODO: 구현 예정
        return null;
    }

    @Override
    public List<StatusStatisticsDto> getStatusStatistics() {
        // TODO: 구현 예정
        return null;
    }

    // Private helper methods

    private List<ResponsibilityDocumentDto> convertToDto(List<ResponsibilityDocument> documents) {
        return documents.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ResponsibilityDocumentDto convertToDto(ResponsibilityDocument document) {
        return convertToDtoWithJoin(document);
    }



    private ResponsibilityDocumentDto convertToDtoWithJoin(ResponsibilityDocument document) {
        return new ResponsibilityDocumentDto() {
            @Override
            public Long getDocumentId() { return document.getDocumentId(); }

            @Override
            public Long getPositionId() { return null; }

            @Override
            public String getPositionName() { return null; }

            @Override
            public Long getResponsibilityId() { return null; }

            @Override
            public String getDocumentTitle() { return document.getDocumentTitle(); }

            @Override
            public String getDocumentVersion() { return document.getDocumentVersion(); }

            @Override
            public String getDocumentContent() { return document.getDocumentContent(); }

            @Override
            public ResponsibilityDocument.DocumentStatus getStatus() { return document.getStatus(); }

            @Override
            public Long getApprovalId() { return document.getApprovalId(); }

            @Override
            public LocalDate getEffectiveDate() { return document.getEffectiveDate(); }

            @Override
            public LocalDate getExpiryDate() { return document.getExpiryDate(); }

            @Override
            public String getAuthorEmpNo() { return document.getAuthorEmpNo(); }

            @Override
            public String getAuthorName() {
                return document.getAuthor() != null ? document.getAuthor().getEmpName() : null;
            }

            @Override
            public String getReviewerEmpNo() { return document.getReviewerEmpNo(); }

            @Override
            public String getReviewerName() {
                return document.getReviewer() != null ? document.getReviewer().getEmpName() : null;
            }

            @Override
            public String getApproverEmpNo() { return document.getApproverEmpNo(); }

            @Override
            public String getApproverName() {
                return document.getApprover() != null ? document.getApprover().getEmpName() : null;
            }
        };
    }
}