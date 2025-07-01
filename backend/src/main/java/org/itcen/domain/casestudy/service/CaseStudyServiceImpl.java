package org.itcen.domain.casestudy.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.casestudy.dto.CaseStudyDto;
import org.itcen.domain.casestudy.entity.CaseStudy;
import org.itcen.domain.casestudy.repository.CaseStudyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CaseStudy 비즈니스 로직 구현
 * 서비스 계층의 책임만 가짐
 */
@Service
@RequiredArgsConstructor
public class CaseStudyServiceImpl implements CaseStudyService {

    private final CaseStudyRepository caseStudyRepository;

    @Override
    public List<CaseStudyDto> getRecentCaseStudies(int limit) {
        return caseStudyRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private CaseStudyDto convertToDto(CaseStudy entity) {
        return CaseStudyDto.builder()
                .caseStudyId(entity.getCaseStudyId())
                .caseStudyTitle(entity.getCaseStudyTitle())
                .caseStudyContent(entity.getCaseStudyContent())
                .createdId(entity.getCreatedId())
                .updatedId(entity.getUpdatedId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}