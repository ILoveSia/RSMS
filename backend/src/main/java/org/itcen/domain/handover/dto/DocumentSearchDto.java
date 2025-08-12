package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.ResponsibilityDocument;
import org.itcen.domain.handover.service.ResponsibilityDocumentService;

import java.time.LocalDate;

/**
 * 책무기술서 검색 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSearchDto implements ResponsibilityDocumentService.DocumentSearchDto {
    private Long positionId;
    private String status;
    private String authorEmpNo;
    private String documentTitle;
    private String positionName;
    private LocalDate startDate;
    private LocalDate endDate;
}