package org.itcen.domain.executiveresponsibility.controller;

import java.util.List;
import org.itcen.domain.executiveresponsibility.dto.ExecutiveResponsibilityDto;
import org.itcen.domain.executiveresponsibility.service.ExecutiveResponsibilityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
/**
 * 임원별 책무 현황 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/executive-responsibilities")
@RequiredArgsConstructor
public class ExecutiveResponsibilityController {

    private final ExecutiveResponsibilityService executiveResponsibilityService;

    @GetMapping
    public List<ExecutiveResponsibilityDto> getAll() {
        List<ExecutiveResponsibilityDto> result = executiveResponsibilityService.getAll();
        return result;
    }
    @GetMapping("/{positionId}")
        public List<ExecutiveResponsibilityDto> getByPositionId(@PathVariable Long positionId) {
        List<ExecutiveResponsibilityDto> result = executiveResponsibilityService.getByPositionId(positionId);
        return result;
    }
}
