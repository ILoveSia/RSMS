package org.itcen.domain.submission.service;

import org.itcen.domain.submission.dto.SubmissionDto;

import java.time.LocalDate;
import java.util.List;

public interface SubmissionService {
    SubmissionDto createSubmission(SubmissionDto dto);
    SubmissionDto updateSubmission(Long id, SubmissionDto dto);
    SubmissionDto getSubmission(Long id);
    
    /**
     * 제출 이력 조회 (positions 테이블과 조인)
     */
    List<SubmissionDto> getSubmissionHistoryWithPositions(LocalDate startDate, LocalDate endDate, String ledgerOrder);
    
    /**
     * 제출 이력 일괄 삭제
     */
    void deleteSubmissions(List<Long> ids);
}
