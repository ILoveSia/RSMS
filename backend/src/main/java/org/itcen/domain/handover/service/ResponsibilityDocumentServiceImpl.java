package org.itcen.domain.handover.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.handover.dto.ApprovalStartRequestDto;
import org.itcen.domain.handover.dto.DocumentSearchDto;
import org.itcen.domain.handover.entity.ResponsibilityDocument;
import org.itcen.domain.handover.repository.ResponsibilityDocumentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
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

        // status 컬럼 삭제되어 상태 확인 로직 제거
        
        // 필드 업데이트
        existingDocument.setDocumentTitle(document.getDocumentTitle());
        existingDocument.setDocumentContent(document.getDocumentContent());
        existingDocument.setDocumentVersion(document.getDocumentVersion());
        existingDocument.setEffectiveDate(document.getEffectiveDate());
        existingDocument.setExpiryDate(document.getExpiryDate());
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

        // status 컬럼 삭제되어 상태 확인 로직 제거

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

        // 제출 가능성 기본 확인
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

        // 승인 처리
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

        // 발행 처리
        document.setUpdatedId(actorEmpNo);
        responsibilityDocumentRepository.save(document);

        log.debug("문서 발행 완료 - documentId: {}", documentId);
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
    public List<ResponsibilityDocumentDto> getDocumentsByStatus(String status) {
        log.debug("상태별 책무기술서 조회 - status: {}", status);
        // status 필드 제거로 인해 전체 문서 조회
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findByPositionIdOrderByCreatedAtDesc();
        return convertToDto(documents);
    }

    @Override
    public List<ResponsibilityDocumentDto> getDocumentsByAuthor(String authorEmpNo) {
        log.debug("작성자별 책무기술서 조회 - authorEmpNo: {}", authorEmpNo);
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findByAuthorEmpNoWithJoin(authorEmpNo);
        return convertToDto(documents);
    }

    @Override
    public List<ResponsibilityDocumentDto> getValidDocuments() {
        log.debug("유효한 문서 조회");
        List<ResponsibilityDocument> documents = responsibilityDocumentRepository.findValidDocuments(LocalDate.now());
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
                searchDto.getAuthorEmpNo(),
                searchDto.getDocumentTitle(),
                pageable
        );

        return results.map(this::convertToDtoWithJoin);
    }
    // 결재 연동 메소드들

    @Override
    public Page<ResponsibilityDocumentWithApprovalDto> searchDocumentsWithApproval(DocumentSearchDto searchDto, Pageable pageable) {
        log.info("결재 연동 검색 - searchDto: {}", searchDto);
        log.info("Repository 호출 파라미터 - authorEmpNo: '{}', documentTitle: '{}'", 
                searchDto.getAuthorEmpNo(), searchDto.getDocumentTitle());

        // Native Query로 approval 테이블과 조인해서 데이터 조회
        Page<Object[]> results = responsibilityDocumentRepository.findBySearchCriteriaWithApproval(
                searchDto.getAuthorEmpNo(),
                searchDto.getDocumentTitle(),
                pageable
        );

        log.info("검색 결과 개수: {}", results.getTotalElements());
        return results.map(this::convertObjectArrayToApprovalDto);
    }

    @Override
    @Transactional
    public void startApproval(Long documentId, ApprovalStartRequestDto request) {
        log.debug("결재 요청 시작 - documentId: {}, taskType: {}", documentId, request.getTaskTypeCode());

        Optional<ResponsibilityDocument> documentOpt = responsibilityDocumentRepository.findById(documentId);
        if (documentOpt.isEmpty()) {
            throw new BusinessException("문서를 찾을 수 없습니다. documentId: " + documentId);
        }

        ResponsibilityDocument document = documentOpt.get();
        
        // 결재 요청 가능성 기본 확인

        // TODO: 실제 구현에서는 approval 테이블에 레코드 생성 필요
        // 현재는 로그만 출력
        log.info("결재 요청 생성됨 - documentId: {}, title: {}", documentId, request.getTitle());
    }

    @Override
    @Transactional
    public void approveApproval(Long documentId, String comment) {
        log.debug("결재 승인 - documentId: {}, comment: {}", documentId, comment);

        // TODO: 실제 구현에서는 approval 테이블 업데이트 및 다음 단계 처리 필요
        log.info("결재 승인 처리됨 - documentId: {}", documentId);
    }

    @Override
    @Transactional
    public void rejectApproval(Long documentId, String reason) {
        log.debug("결재 반려 - documentId: {}, reason: {}", documentId, reason);

        // TODO: 실제 구현에서는 approval 테이블 업데이트 및 문서 상태 변경 필요
        log.info("결재 반려 처리됨 - documentId: {}, reason: {}", documentId, reason);
    }

    @Override
    @Transactional
    public void cancelApproval(Long documentId) {
        log.debug("결재 취소 - documentId: {}", documentId);

        // TODO: 실제 구현에서는 approval 테이블 상태 변경 필요
        log.info("결재 취소됨 - documentId: {}", documentId);
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
            public String getStatus() { return null; } // status 컬럼 삭제됨

            @Override
            public Long getApprovalId() { return document.getApprovalId(); }

            @Override
            public LocalDate getEffectiveDate() { return document.getEffectiveDate(); }

            @Override
            public LocalDate getExpiryDate() { return document.getExpiryDate(); }

            @Override
            public String getAuthorEmpNo() { return document.getAuthorEmpNo(); }


            // 검토자, 승인자는 approval 테이블에서 관리
            
            @Override
            public Long getAttachmentCount() {
                return document.getAttachments() != null ? (long) document.getAttachments().size() : 0L;
            }

            @Override
            public List<AttachmentInfo> getAttachments() {
                if (document.getAttachments() == null) {
                    return new ArrayList<>();
                }
                return document.getAttachments().stream()
                    .map(attachment -> new AttachmentInfo() {
                        @Override
                        public Long getAttachId() { return attachment.getAttachId(); }
                        @Override
                        public String getOriginalName() { return attachment.getOriginalName(); }
                        @Override
                        public String getStoredName() { return attachment.getStoredName(); }
                        @Override
                        public Long getFileSize() { return attachment.getFileSize(); }
                        @Override
                        public String getMimeType() { return attachment.getMimeType(); }
                    })
                    .collect(Collectors.toList());
            }
        };
    }


    /**
     * Native Query 결과를 ResponsibilityDocumentWithApprovalDto로 변환
     */
    private ResponsibilityDocumentWithApprovalDto convertObjectArrayToApprovalDto(Object[] row) {
        // 디버깅을 위한 로깅 추가
        log.info("Converting Object Array to DTO. Array length: {}", row.length);
        for (int i = 0; i < row.length; i++) {
            log.info("row[{}] = {} (type: {})", i, row[i], row[i] != null ? row[i].getClass().getName() : "null");
        }
        
        return new ResponsibilityDocumentWithApprovalDto() {
            @Override
            public Long getDocumentId() { 
                return safeLongValue(row[0]); 
            }

            @Override
            public Long getPositionId() { return null; }

            @Override
            public String getPositionName() { return null; }

            @Override
            public Long getResponsibilityId() { return null; }

            @Override
            public String getDocumentTitle() { 
                return safeStringValue(row[1]); 
            }

            @Override
            public String getDocumentVersion() { 
                return safeStringValue(row[2]); 
            }

            @Override
            public String getDocumentContent() { 
                return safeStringValue(row[3]); 
            }

            @Override
            public String getStatus() { 
                // status 컬럼이 삭제되었으므로 항상 null 반환
                return null;
            }

            @Override
            public LocalDate getEffectiveDate() { 
                return safeDateValue(row[4]); // rd.effective_date (인덱스 4로 변경)
            }

            @Override
            public LocalDate getExpiryDate() { 
                return safeDateValue(row[5]); // rd.expiry_date (인덱스 5로 변경)
            }

            @Override
            public String getAuthorEmpNo() { 
                return safeStringValue(row[6]); // rd.author_emp_no (인덱스 6으로 변경)
            }
            
            // 감사 필드
            @Override
            public LocalDate getCreatedAt() {
                return safeTimestampValue(row[8]); // rd.created_at (인덱스 8로 변경)
            }

            @Override
            public LocalDate getUpdatedAt() {
                return safeTimestampValue(row[9]); // rd.updated_at (인덱스 9로 변경)
            }

            @Override
            public String getCreatedId() {
                return safeStringValue(row[10]); // rd.created_id (인덱스 10으로 변경)
            }

            @Override
            public String getUpdatedId() {
                return safeStringValue(row[11]); // rd.updated_id (인덱스 11로 변경)
            }
            
            @Override
            public Long getAttachmentCount() { 
                return safeLongValue(row[17]); // attachment_count (인덱스 17)
            }

            @Override
            public List<AttachmentInfo> getAttachments() { return new ArrayList<>(); }

            // 결재 관련 필드 (Native Query에서 조회) - 인덱스 업데이트
            @Override
            public String getApprovalStatus() {
                String status = safeStringValue(row[12]); // approval_status (인덱스 12로 변경)
                return status != null ? status : "NONE";
            }

            @Override
            public Long getApprovalId() { 
                return safeLongValue(row[13]); // ap.approval_id (인덱스 13으로 변경)
            }

            @Override
            public String getRequesterId() { 
                return safeStringValue(row[14]); // ap.requester_id (인덱스 14로 변경)
            }

            @Override
            public String getRequesterName() { return null; }

            @Override
            public String getCurrentApproverId() { 
                return safeStringValue(row[15]); // ap.approver_id (인덱스 15로 변경)
            }

            @Override
            public String getCurrentApproverName() { return null; }

            @Override
            public LocalDate getApprovedAt() { 
                return safeTimestampValue(row[16]); // ap.approval_datetime (인덱스 16으로 변경)
            }

            @Override
            public LocalDate getRejectedAt() { 
                if ("REJECTED".equals(getApprovalStatus())) {
                    return safeTimestampValue(row[16]); // ap.approval_datetime (인덱스 16으로 변경)
                }
                return null; 
            }

            @Override
            public String getRejectionReason() { 
                // 추후 comments 필드를 쿼리에 추가할 수 있음
                return null; 
            }
            
            // authorName 추가
            @Override
            public String getAuthorName() {
                return safeStringValue(row[7]); // e.emp_name (인덱스 7)
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