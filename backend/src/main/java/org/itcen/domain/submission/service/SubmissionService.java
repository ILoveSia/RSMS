package org.itcen.domain.submission.service;

import org.itcen.domain.submission.dto.SubmissionDto;

public interface SubmissionService {
    SubmissionDto createSubmission(SubmissionDto dto);
    SubmissionDto updateSubmission(Long id, SubmissionDto dto);
    SubmissionDto getSubmission(Long id);
}
