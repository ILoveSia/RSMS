package org.itcen.domain.casestudy.service;

import org.itcen.domain.casestudy.dto.CaseStudyDto;
import java.util.List;

/**
 * CaseStudy 비즈니스 로직 추상화
 */
public interface CaseStudyService {
    List<CaseStudyDto> getRecentCaseStudies(int limit);

}