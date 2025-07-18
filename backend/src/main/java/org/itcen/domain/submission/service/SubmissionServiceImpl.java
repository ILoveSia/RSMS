package org.itcen.domain.submission.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.submission.dto.SubmissionDto;
import org.itcen.domain.submission.entity.Submission;
import org.itcen.domain.submission.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository repository;

    @Override
    @Transactional
    public SubmissionDto createSubmission(SubmissionDto dto) {
        Submission entity = Submission.builder()
            .historyCode(dto.getHistoryCode())
            .executiveName(dto.getExecutiveName())
            .position(dto.getPosition())
            .submissionDate(dto.getSubmissionDate())
            .attachmentFile(dto.getAttachmentFile())
            .remarks(dto.getRemarks())
            .build();
        Submission saved = repository.save(entity);
        dto.setId(saved.getId());
        return dto;
    }

    @Override
    @Transactional
    public SubmissionDto updateSubmission(Long id, SubmissionDto dto) {
        Submission entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("제출 이력이 존재하지 않습니다."));
        entity.setHistoryCode(dto.getHistoryCode());
        entity.setExecutiveName(dto.getExecutiveName());
        entity.setPosition(dto.getPosition());
        entity.setSubmissionDate(dto.getSubmissionDate());
        entity.setAttachmentFile(dto.getAttachmentFile());
        entity.setRemarks(dto.getRemarks());
        repository.save(entity);
        dto.setId(entity.getId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDto getSubmission(Long id) {
        Submission entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("제출 이력이 존재하지 않습니다."));
        return SubmissionDto.builder()
            .id(entity.getId())
            .historyCode(entity.getHistoryCode())
            .executiveName(entity.getExecutiveName())
            .position(entity.getPosition())
            .submissionDate(entity.getSubmissionDate())
            .attachmentFile(entity.getAttachmentFile())
            .remarks(entity.getRemarks())
            .build();
    }
}
