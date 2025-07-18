package org.itcen.domain.positionresponsibility.controller;

import java.util.List;
import org.itcen.domain.positionresponsibility.dto.PositionResponsibilityDto;
import org.itcen.domain.positionresponsibility.service.PositionResponsibilityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 임원별 책무 현황 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/position-responsibilities")
@RequiredArgsConstructor
public class PositionResponsibilityController {

    private final PositionResponsibilityService positionResponsibilityService;

    @GetMapping
    public List<PositionResponsibilityDto> getAll() {
        log.info("getAll() method called");
        List<PositionResponsibilityDto> result = positionResponsibilityService.getAll();
        log.info("Returning {} items", result.size());
        return result;
    }
}
