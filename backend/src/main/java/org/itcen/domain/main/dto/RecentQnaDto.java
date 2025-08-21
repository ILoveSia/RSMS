package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 최근 QnA 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentQnaDto {
    
    private Long id;
    private String title;
    private String category;
    private String status; // PENDING, ANSWERED, CLOSED
    private String questionerEmpNo;
    private LocalDateTime createdAt;
    private Integer viewCount;
    private Boolean isAnswered;
}