package org.itcen.domain.audit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.*;
import org.itcen.domain.audit.entity.AuditProgMngtDetail;
import org.itcen.domain.audit.repository.AuditProgMngtDetailRepository;
import org.itcen.domain.common.entity.Attachment;
import org.itcen.domain.common.repository.AttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 점검결과 Service 구현체
 * 
 * 단일 책임 원칙(SRP): 점검결과 비즈니스 로직만 담당
 * 의존성 역전 원칙(DIP): Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuditResultServiceImpl implements AuditResultService {

    private final AuditProgMngtDetailRepository auditProgMngtDetailRepository;
    private final AttachmentRepository attachmentRepository;

    /**
     * 점검결과 저장
     * 
     * @param request 점검결과 저장 요청 데이터
     * @return 저장 결과
     */
    @Override
    public AuditResultSaveResponseDto saveAuditResult(AuditResultSaveRequestDto request) {
        log.debug("점검결과 저장 시작 - 항목수: {}", request.getAuditProgMngtDetailIds().size());

        try {
            // 1. audit_prog_mngt_detail 테이블 업데이트
            int updatedCount = updateAuditProgMngtDetails(request);

            // 2. attachments 테이블에 첨부파일 저장
            List<Long> attachmentIds = saveAttachments(request);

            log.debug("점검결과 저장 완료 - 업데이트: {}건, 첨부파일: {}개", updatedCount, attachmentIds.size());

            return AuditResultSaveResponseDto.builder()
                    .success(true)
                    .message("점검결과가 성공적으로 저장되었습니다.")
                    .updatedCount(updatedCount)
                    .attachmentIds(attachmentIds)
                    .build();

        } catch (Exception e) {
            log.error("점검결과 저장 오류", e);
            return AuditResultSaveResponseDto.builder()
                    .success(false)
                    .message("점검결과 저장 중 오류가 발생했습니다: " + e.getMessage())
                    .updatedCount(0)
                    .attachmentIds(new ArrayList<>())
                    .build();
        }
    }

    /**
     * audit_prog_mngt_detail 테이블 업데이트
     */
    private int updateAuditProgMngtDetails(AuditResultSaveRequestDto request) {
        LocalDate auditDoneDt = null;
        if (request.getAuditDoneDt() != null && !request.getAuditDoneDt().trim().isEmpty()) {
            auditDoneDt = LocalDate.parse(request.getAuditDoneDt(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }

        int updatedCount = 0;
        
        for (Long auditProgMngtDetailId : request.getAuditProgMngtDetailIds()) {
            try {
                // 기존 엔티티 조회
                AuditProgMngtDetail detail = auditProgMngtDetailRepository.findById(auditProgMngtDetailId)
                        .orElseThrow(() -> new RuntimeException("점검계획상세를 찾을 수 없습니다: " + auditProgMngtDetailId));

                // 엔티티 업데이트
                detail.updateAuditResult(
                        request.getAuditResultStatusCd(),
                        request.getAuditResult(),
                        request.getBeforeAuditYn(),
                        request.getAuditDetailContent(),
                        auditDoneDt
                );

                // audit_result_status_cd가 INS02(적정) 또는 INS04(점검제외)인 경우 audit_final_result_yn을 'Y'로 업데이트
                if ("INS02".equals(request.getAuditResultStatusCd()) || "INS04".equals(request.getAuditResultStatusCd())) {
                    detail.updateAuditFinalResultYn("Y");
                    log.debug("audit_final_result_yn을 'Y'로 업데이트 - ID: {}, status: {}", 
                            auditProgMngtDetailId, request.getAuditResultStatusCd());
                }

                // 저장 (JPA dirty checking으로 자동 업데이트)
                auditProgMngtDetailRepository.save(detail);
                updatedCount++;

                log.debug("점검계획상세 업데이트 완료 - ID: {}", auditProgMngtDetailId);

            } catch (Exception e) {
                log.error("점검계획상세 업데이트 실패 - ID: {}", auditProgMngtDetailId, e);
                throw new RuntimeException("점검계획상세 업데이트 실패: " + auditProgMngtDetailId, e);
            }
        }

        return updatedCount;
    }

    /**
     * 첨부파일 저장
     */
    private List<Long> saveAttachments(AuditResultSaveRequestDto request) {
        List<Long> attachmentIds = new ArrayList<>();

        if (request.getAttachments() == null || request.getAttachments().isEmpty()) {
            return attachmentIds;
        }

        for (AuditResultSaveRequestDto.AttachmentDataDto attachmentData : request.getAttachments()) {
            try {
                // Base64 디코딩
                byte[] fileBytes = Base64.getDecoder().decode(attachmentData.getFileData());

                // 파일 저장 로직 (실제 파일 시스템에 저장)
                String storedName = generateStoredFileName(attachmentData.getFileName());
                String filePath = saveFileToStorage(fileBytes, storedName);

                // Attachment 엔티티 생성
                Attachment attachment = Attachment.builder()
                        .entityType("audit_prog_mngt_detail")
                        .entityId(request.getAuditProgMngtDetailIds().get(0))
                        .originalName(attachmentData.getFileName())
                        .storedName(storedName)
                        .filePath(filePath)
                        .fileSize(attachmentData.getFileSize())
                        .contentType(attachmentData.getFileType())
                        .mimeType(attachmentData.getFileType())
                        .uploadedBy("SYSTEM") // 현재 사용자로 변경 필요
                        .createdId("SYSTEM") // 현재 사용자로 변경 필요
                        .build();

                // 저장
                Attachment savedAttachment = attachmentRepository.save(attachment);
                attachmentIds.add(savedAttachment.getAttachId());

                log.debug("첨부파일 저장 완료 - ID: {}, 파일명: {}", 
                        savedAttachment.getAttachId(), attachmentData.getFileName());

            } catch (Exception e) {
                log.error("첨부파일 저장 실패 - 파일명: {}", attachmentData.getFileName(), e);
                throw new RuntimeException("첨부파일 저장 실패: " + attachmentData.getFileName(), e);
            }
        }

        return attachmentIds;
    }

    /**
     * 저장될 파일명 생성 (UUID 기반)
     */
    private String generateStoredFileName(String originalFileName) {
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex);
        }
        return UUID.randomUUID().toString() + extension;
    }

    /**
     * 점검결과 수정
     * 
     * @param request 점검결과 수정 요청 데이터
     * @return 수정 결과
     */
    @Override
    public AuditResultSaveResponseDto updateAuditResult(AuditResultSaveRequestDto request) {
        log.debug("점검결과 수정 시작 - 항목수: {}", request.getAuditProgMngtDetailIds().size());

        try {
            // 1. audit_prog_mngt_detail 테이블 업데이트
            int updatedCount = updateAuditProgMngtDetails(request);

            // 2. 기존 첨부파일 삭제 (선택사항 - 요구사항에 따라)
            // deleteExistingAttachments(request.getAuditProgMngtDetailIds());

            // 3. 새로운 첨부파일 저장
            List<Long> attachmentIds = saveAttachments(request);

            log.debug("점검결과 수정 완료 - 업데이트: {}건, 첨부파일: {}개", updatedCount, attachmentIds.size());

            return AuditResultSaveResponseDto.builder()
                    .success(true)
                    .message("점검결과가 성공적으로 수정되었습니다.")
                    .updatedCount(updatedCount)
                    .attachmentIds(attachmentIds)
                    .build();

        } catch (Exception e) {
            log.error("점검결과 수정 오류", e);
            return AuditResultSaveResponseDto.builder()
                    .success(false)
                    .message("점검결과 수정 중 오류가 발생했습니다: " + e.getMessage())
                    .updatedCount(0)
                    .attachmentIds(new ArrayList<>())
                    .build();
        }
    }

    /**
     * 점검결과 상세 조회
     * 
     * @param request 점검결과 상세 조회 요청 데이터
     * @return 조회 결과
     */
    @Override
    @Transactional(readOnly = true)
    public List<AuditResultDetailResponseDto> getAuditResultDetail(AuditResultDetailRequestDto request) {
        log.debug("점검결과 상세 조회 시작 - 항목수: {}", request.getAuditProgMngtDetailIds().size());

        try {
            // 점검결과 데이터 조회
            List<AuditProgMngtDetail> details = auditProgMngtDetailRepository
                    .findByAuditProgMngtDetailIdIn(request.getAuditProgMngtDetailIds());

            // 응답 DTO 변환
            List<AuditResultDetailResponseDto> responseList = details.stream()
                    .map(this::convertToDetailResponseDto)
                    .collect(Collectors.toList());

            log.debug("점검결과 상세 조회 완료 - 조회된 항목수: {}", responseList.size());
            return responseList;

        } catch (Exception e) {
            log.error("점검결과 상세 조회 실패", e);
            throw new RuntimeException("점검결과 상세 조회 실패", e);
        }
    }

    /**
     * AuditProgMngtDetail을 AuditResultDetailResponseDto로 변환
     */
    private AuditResultDetailResponseDto convertToDetailResponseDto(AuditProgMngtDetail detail) {
        // 첨부파일 조회
        List<Attachment> attachments = attachmentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
                "audit_prog_mngt_detail", detail.getAuditProgMngtDetailId());

        // 첨부파일 DTO 변환
        List<ExistingAttachmentDto> attachmentDtos = attachments.stream()
                .map(attachment -> new ExistingAttachmentDto(
                        attachment.getAttachId(),
                        attachment.getOriginalName(),
                        attachment.getFileSize(),
                        attachment.getContentType(),
                        attachment.getCreatedAt() != null ? 
                            attachment.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : ""
                ))
                .collect(Collectors.toList());

        return new AuditResultDetailResponseDto(
                detail.getAuditProgMngtDetailId(),
                detail.getAuditResultStatusCd() != null ? detail.getAuditResultStatusCd() : "",
                detail.getAuditResult() != null ? detail.getAuditResult() : "",
                detail.getBeforeAuditYn() != null ? detail.getBeforeAuditYn() : "",
                detail.getAuditDetailContent() != null ? detail.getAuditDetailContent() : "",
                detail.getAuditDoneDt() != null ? detail.getAuditDoneDt().toString() : "",
                attachmentDtos
        );
    }

    /**
     * 이행결과 업데이트
     * 
     * @param request 이행결과 업데이트 요청 데이터
     * @return 업데이트 결과
     */
    @Override
    public ImplementationResultUpdateResponseDto updateImplementationResult(ImplementationResultUpdateRequestDto request) {
        log.info("이행결과 업데이트 시작 - auditProgMngtDetailId: {}", request.getAuditProgMngtDetailId());
        log.info("요청 데이터: {}", request);

        try {
            // 1. 기존 엔티티 조회
            log.info("DB에서 auditProgMngtDetailId {} 조회 시도", request.getAuditProgMngtDetailId());
            AuditProgMngtDetail detail = auditProgMngtDetailRepository.findById(request.getAuditProgMngtDetailId())
                    .orElseThrow(() -> new RuntimeException("점검계획상세를 찾을 수 없습니다: " + request.getAuditProgMngtDetailId()));

            log.info("엔티티 조회 성공 - detail: {}", detail);

            // 2. audit_done_content 업데이트
            detail.setAuditDoneContent(request.getAuditDoneContent());
            
            // 3. imp_pl_status_cd를 PLI02로 업데이트
            detail.setImpPlStatusCd("PLI02");

            log.info("업데이트할 내용 - auditDoneContent: {}, impPlStatusCd: PLI02", request.getAuditDoneContent());

            // 4. 엔티티 저장 (JPA dirty checking으로 자동 업데이트)
            auditProgMngtDetailRepository.save(detail);

            log.info("이행결과 업데이트 완료 - auditProgMngtDetailId: {}, impPlStatusCd: PLI02", 
                    request.getAuditProgMngtDetailId());

            return ImplementationResultUpdateResponseDto.builder()
                    .success(true)
                    .message("이행결과가 성공적으로 저장되었습니다.")
                    .auditProgMngtDetailId(request.getAuditProgMngtDetailId())
                    .impPlStatusCd("PLI02")
                    .build();

        } catch (Exception e) {
            log.error("이행결과 업데이트 실패 - auditProgMngtDetailId: {}", request.getAuditProgMngtDetailId(), e);
            
            return ImplementationResultUpdateResponseDto.builder()
                    .success(false)
                    .message("이행결과 저장 중 오류가 발생했습니다: " + e.getMessage())
                    .auditProgMngtDetailId(request.getAuditProgMngtDetailId())
                    .impPlStatusCd(null)
                    .build();
        }
    }

    /**
     * 파일을 실제 스토리지에 저장
     */
    private String saveFileToStorage(byte[] fileBytes, String storedName) {
        try {
            // 업로드 디렉토리 설정 (실제 환경에서는 설정파일로 관리)
            String uploadDir = System.getProperty("java.io.tmpdir") + "/itcen/attachments/";
            Path uploadPath = Paths.get(uploadDir);
            
            // 디렉토리가 없으면 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 파일 저장
            Path filePath = uploadPath.resolve(storedName);
            Files.write(filePath, fileBytes);
            
            return filePath.toString();
            
        } catch (IOException e) {
            log.error("파일 저장 실패 - 파일명: {}", storedName, e);
            throw new RuntimeException("파일 저장 실패: " + storedName, e);
        }
    }
}