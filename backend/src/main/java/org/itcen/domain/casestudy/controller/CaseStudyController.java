package org.itcen.domain.casestudy.controller;

import lombok.RequiredArgsConstructor;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.casestudy.dto.CaseStudyDto;
import org.itcen.domain.casestudy.service.CaseStudyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CaseStudy API 컨트롤러
 * API 요청/응답 책임만 가짐
 */
@RestController
@RequestMapping("/case-studies")
@RequiredArgsConstructor
public class CaseStudyController {

    private final CaseStudyService caseStudyService;

    @GetMapping("/recent")
    public ApiResponse<List<CaseStudyDto>> getRecentCaseStudies(@RequestParam(defaultValue = "5") int limit) {
        List<CaseStudyDto> caseStudies = caseStudyService.getRecentCaseStudies(limit);
        return ApiResponse.success(caseStudies);
    }
}