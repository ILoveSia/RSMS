package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 기존 첨부파일 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExistingAttachmentDto {
    
    /**
     * 첨부파일 ID
     */
    private Long attachId;
    
    /**
     * 파일명
     */
    private String fileName;
    
    /**
     * 파일크기
     */
    private Long fileSize;
    
    /**
     * 파일타입
     */
    private String fileType;
    
    /**
     * 업로드일시
     */
    private String uploadDt;
}