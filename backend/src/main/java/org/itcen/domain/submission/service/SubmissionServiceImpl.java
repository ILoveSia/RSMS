package org.itcen.domain.submission.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.submission.dto.SubmissionDto;
import org.itcen.domain.submission.entity.Submission;
import org.itcen.domain.submission.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
            .positionsId(dto.getPositionsId())
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
        entity.setPositionsId(dto.getPositionsId());
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
            .positionsId(entity.getPositionsId())
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionHistoryWithPositions(LocalDate startDate, LocalDate endDate, String ledgerOrder) {
        log.info("제출 이력 조회 서비스 호출: startDate={}, endDate={}, ledgerOrder={}", startDate, endDate, ledgerOrder);
        
        List<Object[]> results = repository.findSubmissionHistoryWithPositions(startDate, endDate, ledgerOrder);
        
        return results.stream()
            .map(this::mapToSubmissionDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteSubmissions(List<Long> ids) {
        log.info("제출 이력 일괄 삭제 서비스 호출: ids={}", ids);
        repository.deleteAllById(ids);
    }
    
    private SubmissionDto mapToSubmissionDto(Object[] row) {
        return SubmissionDto.builder()
            .id(((BigInteger) row[0]).longValue())
            .historyCode((String) row[1])
            .executiveName((String) row[2])
            .position((String) row[3])
            .submissionDate(((Date) row[4]).toLocalDate())
            .attachmentFile((String) row[5])
            .remarks((String) row[6])
            .positionsId(row[7] != null ? ((BigInteger) row[7]).longValue() : null)
            .positionsNm((String) row[8])
            .ledgerOrder((String) row[9])
            .confirmGubunCd((String) row[10])
            .writeDeptCd((String) row[11])
            .build();
    }
}
