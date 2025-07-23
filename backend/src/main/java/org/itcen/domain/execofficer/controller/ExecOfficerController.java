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
    public ApiResponse<List<ExecOfficerDto>> getAll() {
        log.info("getAll() method called");
        return ApiResponse.success(service.getAll());
    }

    @PostMapping
    public ApiResponse<ExecOfficerDto> create(@RequestBody ExecOfficerDto dto) {
        return ApiResponse.success(service.create(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<ExecOfficerDto> update(@PathVariable Long id, @RequestBody String rawJson) {
        log.info("Raw JSON 받은 내용: {}", rawJson);
        
        try {
            // ObjectMapper로 수동 파싱
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            ExecOfficerDto dto = mapper.readValue(rawJson, ExecOfficerDto.class);
            
            log.info("파싱된 DTO: {}", dto);
            log.info("파싱된 execofficerDt: '{}'", dto.getExecofficer_dt());
            
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
