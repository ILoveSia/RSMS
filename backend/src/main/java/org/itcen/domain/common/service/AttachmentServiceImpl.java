package org.itcen.domain.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.common.dto.AttachmentDto;
import org.itcen.domain.common.entity.Attachment;
import org.itcen.domain.common.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 첨부파일 서비스 구현체
 * 
 * 첨부파일 관련 비즈니스 로직을 구현하는 서비스입니다.
 * 파일 업로드, 다운로드, 삭제 등의 기능을 제공합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 첨부파일 관련 비즈니스 로직만 담당
 * - Open/Closed: 새로운 파일 처리 로직 추가에 열려있음
 * - Dependency Inversion: Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.file.max-size:10485760}") // 10MB
    private long maxFileSize;

    @Value("${app.file.allowed-types:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif}")
    private String allowedTypes;

    /**
     * 여러 파일 업로드
     */
    @Override
    @Transactional
    public List<AttachmentDto.UploadResult> uploadFiles(List<MultipartFile> files, AttachmentDto.UploadRequest uploadRequest) throws IOException {

        List<AttachmentDto.UploadResult> results = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                AttachmentDto.UploadResult result = uploadFile(file, uploadRequest);
                results.add(result);
            } catch (Exception e) {
                log.error("파일 업로드 실패: {}", file.getOriginalFilename(), e);
                results.add(AttachmentDto.UploadResult.failure(
                    file.getOriginalFilename(), 
                    "파일 업로드에 실패했습니다: " + e.getMessage()));
            }
        }

        return results;
    }

    /**
     * 단일 파일 업로드
     */
    @Override
    @Transactional
    public AttachmentDto.UploadResult uploadFile(MultipartFile file, AttachmentDto.UploadRequest uploadRequest) throws IOException {

        // 파일 유효성 검사
        validateFile(file);

        // 파일 저장
        String storedFilename = generateStoredFilename(file.getOriginalFilename());
        String filePath = saveFile(file, storedFilename);

        // DB 저장
        Attachment attachment = Attachment.builder()
                .contentType(file.getContentType())
                .mimeType(file.getContentType()) // MIME 타입은 content-type과 동일하게 설정
                .filePath(filePath)
                .fileSize(file.getSize())
                .originalName(file.getOriginalFilename())
                .storedName(storedFilename)
                .uploadedBy(uploadRequest.getUploadedBy())
                .entityType(uploadRequest.getEntityType())
                .entityId(uploadRequest.getEntityId())
                .createdId(uploadRequest.getUploadedBy())
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);
        
        return AttachmentDto.UploadResult.success(savedAttachment);
    }

    /**
     * 단일 파일 업데이트
     */
    @Override
    @Transactional
    public AttachmentDto.UploadResult updateFile(MultipartFile file, Long attachId, AttachmentDto.UploadRequest uploadRequest) throws IOException {

        log.info("파일 업데이트 시작 - attachId: {}, originalFilename: {}", attachId, file.getOriginalFilename());

        // 파일 유효성 검사
        validateFile(file);

        // 기존 첨부파일 정보 조회
        Attachment existingAttachment = attachmentRepository.findById(attachId)
                .orElseThrow(() -> new BusinessException("첨부파일을 찾을 수 없습니다."));
        // 기존 파일 삭제
        deletePhysicalFile(existingAttachment.getFilePath());

        // 새 파일 저장
        String storedFilename = generateStoredFilename(file.getOriginalFilename());
        String filePath = saveFile(file, storedFilename);

        // 기존 첨부파일 정보 업데이트
        existingAttachment.updateFileInfo(
                file.getOriginalFilename(),
                storedFilename,
                file.getSize(),
                file.getContentType(),
                uploadRequest.getUploadedBy()
        );
        
        existingAttachment.updateFilePath(filePath, uploadRequest.getUploadedBy());

        Attachment updatedAttachment = attachmentRepository.save(existingAttachment);
        return AttachmentDto.UploadResult.success(updatedAttachment);
    }

    /**
     * 엔티티의 첨부파일 목록 조회
     */
    @Override
    public List<AttachmentDto.Response> getAttachmentsByEntity(String entityType, Long entityId) {

        List<Attachment> attachments = attachmentRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtAsc(entityType, entityId);

        return attachments.stream()
                .map(AttachmentDto.Response::from)
                .collect(Collectors.toList());
    }

    /**
     * 첨부파일 상세 조회
     */
    @Override
    public AttachmentDto.Response getAttachmentById(Long attachId) {
        Attachment attachment = attachmentRepository.findById(attachId)
                .orElseThrow(() -> new BusinessException("첨부파일을 찾을 수 없습니다."));

        return AttachmentDto.Response.from(attachment);
    }

    /**
     * 첨부파일 다운로드 정보 조회
     */
    @Override
    public AttachmentDto.DownloadInfo getDownloadInfo(Long attachId) {
        Attachment attachment = attachmentRepository.findById(attachId)
                .orElseThrow(() -> new BusinessException("첨부파일을 찾을 수 없습니다."));

        return AttachmentDto.DownloadInfo.from(attachment);
    }

    /**
     * 첨부파일 삭제
     */
    @Override
    @Transactional
    public void deleteAttachment(Long attachId, String deletedBy) {
        Attachment attachment = attachmentRepository.findById(attachId)
                .orElseThrow(() -> new BusinessException("첨부파일을 찾을 수 없습니다."));

        // 물리적 파일 삭제
        deletePhysicalFile(attachment.getFilePath());

        // DB에서 삭제
        attachmentRepository.delete(attachment);
    }

    /**
     * 첨부파일 일괄 삭제
     */
    @Override
    @Transactional
    public void deleteAttachments(List<Long> attachIds, String deletedBy) {
        List<Attachment> attachments = attachmentRepository.findAllById(attachIds);

        // 물리적 파일들 삭제
        for (Attachment attachment : attachments) {
            deletePhysicalFile(attachment.getFilePath());
        }

        // DB에서 일괄 삭제
        attachmentRepository.deleteAll(attachments);
    }

    /**
     * 엔티티의 모든 첨부파일 삭제
     */
    @Override
    @Transactional
    public void deleteAllAttachmentsByEntity(String entityType, Long entityId, String deletedBy) {
        List<Attachment> attachments = attachmentRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtAsc(entityType, entityId);

        // 물리적 파일들 삭제
        for (Attachment attachment : attachments) {
            deletePhysicalFile(attachment.getFilePath());
        }

        // DB에서 삭제
        attachmentRepository.deleteAll(attachments);
    }

    /**
     * 엔티티의 첨부파일 개수 조회
     */
    @Override
    public long getAttachmentCount(String entityType, Long entityId) {
        return attachmentRepository.countByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * 파일 존재 여부 확인
     */
    @Override
    public boolean exists(Long attachId) {
        return attachmentRepository.existsById(attachId);
    }

    /**
     * 업로드자의 첨부파일 목록 조회
     */
    @Override
    public List<AttachmentDto.Response> getAttachmentsByUploader(String uploadedBy) {
        List<Attachment> attachments = attachmentRepository
                .findByUploadedByOrderByCreatedAtDesc(uploadedBy);

        return attachments.stream()
                .map(AttachmentDto.Response::from)
                .collect(Collectors.toList());
    }

    /**
     * 첨부파일을 엔티티에 연결합니다.
     * 파일 업로드 시에는 entityType과 entityId가 null로 저장될 수 있으므로,
     * 실제 엔티티 생성 후 이 메서드를 통해 연결 정보를 업데이트합니다.
     *
     * @param entityId 연결할 엔티티의 ID
     * @param entityType 연결할 엔티티의 타입 (예: "SUBMISSION_REPORT")
     * @param attachIds 연결할 첨부파일 ID 목록
     */
    @Override
    @Transactional
    public void linkAttachments(Long entityId, String entityType, List<Long> attachIds) {
        if (attachIds == null || attachIds.isEmpty()) {
            return;
        }
        List<Attachment> attachments = attachmentRepository.findAllById(attachIds);
        for (Attachment attachment : attachments) {
            attachment.updateEntityInfo(entityType, entityId, "system"); // Use existing method
            // Optionally set updatedBy/updatedAt if needed
            // attachment.setUpdatedBy("system"); // Or get from security context
            // attachment.setUpdatedAt(LocalDateTime.now());
        }
        attachmentRepository.saveAll(attachments);
    }


    /**
     * 파일 유효성 검사
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("업로드할 파일이 없습니다.");
        }

        if (file.getSize() > maxFileSize) {
            throw new BusinessException("파일 크기가 너무 큽니다. (최대: " + (maxFileSize / 1024 / 1024) + "MB)");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new BusinessException("파일명이 유효하지 않습니다.");
        }

        String extension = getFileExtension(filename);
        if (!isAllowedFileType(extension)) {
            throw new BusinessException("허용되지 않는 파일 형식입니다. 허용 형식: " + allowedTypes);
        }
    }

    /**
     * 저장할 파일명 생성
     */
    private String generateStoredFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + "." + extension;
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * 허용된 파일 형식 확인
     */
    private boolean isAllowedFileType(String extension) {
        return allowedTypes.toLowerCase().contains(extension);
    }

    /**
     * 실제 파일 저장
     */
    private String saveFile(MultipartFile file, String storedFilename) throws IOException {
        // 업로드 디렉토리 생성 (상대 경로를 절대 경로로 변환)
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일 저장 (중복 시 덮어쓰기)
        Path filePath = uploadPath.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        
        return filePath.toString();
    }

    /**
     * 물리적 파일 삭제
     */
    private void deletePhysicalFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            log.warn("물리적 파일 삭제 실패: {}", filePath, e);
            // 물리적 파일 삭제 실패는 비즈니스 로직에 영향을 주지 않도록 예외를 던지지 않음
        }
    }
}