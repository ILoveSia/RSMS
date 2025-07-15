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
    public ApiResponse<ExecOfficerDto> update(@PathVariable Long id, @RequestBody ExecOfficerDto dto) {
        return ApiResponse.success(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success(null);
    }
}
