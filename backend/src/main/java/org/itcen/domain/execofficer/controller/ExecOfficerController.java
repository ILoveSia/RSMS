package org.itcen.domain.execofficer.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.execofficer.dto.ExecOfficerDto;
import org.itcen.domain.execofficer.service.ExecOfficerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/execofficer")
@RequiredArgsConstructor
public class ExecOfficerController {
    private final ExecOfficerService service;

    @GetMapping
    public ApiResponse<List<ExecOfficerDto>> getAll(
            @RequestParam(name = "ledgerOrdersId", required = false) Long ledgerOrdersId) {
        return ApiResponse.success(service.getAll(ledgerOrdersId));
    }

    @PostMapping
    public ApiResponse<ExecOfficerDto> create(@RequestBody ExecOfficerDto dto) {
        return ApiResponse.success(service.create(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<ExecOfficerDto> update(@PathVariable Long id, @RequestBody String rawJson) {
        try {
            // ObjectMapper로 수동 파싱
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ExecOfficerDto dto = mapper.readValue(rawJson, ExecOfficerDto.class);
            
            return ApiResponse.success(service.update(id, dto));
        } catch (Exception e) {
            log.error("JSON 파싱 실패", e);
            throw new RuntimeException("JSON 파싱 실패", e);
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success(null);
    }
}
