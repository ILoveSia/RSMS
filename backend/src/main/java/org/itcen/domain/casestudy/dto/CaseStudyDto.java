package org.itcen.domain.casestudy.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * CaseStudy 데이터 전송 객체
 * Entity와 분리하여 계층 간 데이터 전달 책임만 가짐
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseStudyDto {
    private Long caseStudyId;
    private String caseStudyTitle;
    private String caseStudyContent;
    private String createdId;
    private String updatedId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}