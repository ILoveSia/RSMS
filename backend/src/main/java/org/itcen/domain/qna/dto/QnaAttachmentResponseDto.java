package org.itcen.domain.qna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.qna.entity.QnaAttachment;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Q&A 첨부파일 응답 DTO
 * 
 * Q&A 첨부파일 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 첨부파일 데이터 전송만 담당
 * - Open/Closed: 새로운 파일 속성 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaAttachmentResponseDto {

    /**
     * 첨부파일 ID
     */
    private Long id;

    /**
     * 원본 파일명
     */
    private String originalFilename;

    /**
     * 파일 크기 (bytes)
     */
    private Long fileSize;

    /**
     * 파일 크기 (포맷된 문자열)
     */
    private String formattedFileSize;

    /**
     * 파일 타입
     */
    private String contentType;

    /**
     * 파일 확장자
     */
    private String fileExtension;

    /**
     * 이미지 파일 여부
     */
    private Boolean isImageFile;

    /**
     * 다운로드 가능 여부
     */
    private Boolean isDownloadable;

    /**
     * 업로드한 사용자 이름
     */
    private String uploadedByName;

    /**
     * 업로드 일시
     */
    private LocalDateTime createdAt;

    /**
     * 업로드 일시 (포맷된 문자열)
     */
    private String createdAtFormatted;

    /**
     * Entity로부터 DTO를 생성하는 정적 팩토리 메서드
     * 
     * @param attachment 첨부파일 엔티티
     * @return QnaAttachmentResponseDto
     */
    public static QnaAttachmentResponseDto from(QnaAttachment attachment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
        
        return QnaAttachmentResponseDto.builder()
                .id(attachment.getId())
                .originalFilename(attachment.getOriginalFilename())
                .fileSize(attachment.getFileSize())
                .formattedFileSize(attachment.getFormattedFileSize())
                .contentType(attachment.getContentType())
                .fileExtension(attachment.getFileExtension())
                .isImageFile(attachment.isImageFile())
                .isDownloadable(attachment.isDownloadable())
                .uploadedByName(attachment.getUploadedBy())
                .createdAt(attachment.getCreatedAt())
                .createdAtFormatted(attachment.getCreatedAt() != null ? 
                    attachment.getCreatedAt().format(formatter) : "")
                .build();
    }
}