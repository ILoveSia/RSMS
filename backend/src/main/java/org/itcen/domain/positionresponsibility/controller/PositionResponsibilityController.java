package org.itcen.domain.positionresponsibility.controller;

import java.util.List;
import org.itcen.domain.positionresponsibility.dto.PositionResponsibilityDto;
import org.itcen.domain.positionresponsibility.dto.PositionResponsibilityDto.ResponsibilityCreateRequestDto;
import org.itcen.domain.positionresponsibility.service.PositionResponsibilityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
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
    public List<PositionResponsibilityDto> getAll(
            @org.springframework.web.bind.annotation.RequestParam(name = "positionsId", required = false) Long positionsId,
            @org.springframework.web.bind.annotation.RequestParam(name = "ledgerOrdersId", required = false) Long ledgerOrdersId) {
        List<PositionResponsibilityDto> result = positionResponsibilityService.getAll(positionsId, ledgerOrdersId);
        return result;
    }

    @GetMapping("/{positionId}")
    public List<PositionResponsibilityDto> getByPositionId( @PathVariable Long positionId) {
        List<PositionResponsibilityDto> result = positionResponsibilityService.getByPositionId(positionId);
        return result;
    }

    @PutMapping
        public boolean updateResponsibility(@RequestBody ResponsibilityCreateRequestDto requestDto) {
        boolean result = positionResponsibilityService.updateResponsibility(requestDto);
        return result;
    }

}
