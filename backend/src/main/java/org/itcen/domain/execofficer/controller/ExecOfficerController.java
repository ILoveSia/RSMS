package org.itcen.domain.execofficer.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.execofficer.dto.ExecOfficerDto;
import org.itcen.domain.execofficer.dto.ExecutiveAuthResponseDto;
import org.itcen.domain.execofficer.dto.ExecutiveDepartmentInfoDto;
import org.itcen.domain.execofficer.service.ExecOfficerService;
import org.itcen.domain.audit.dto.DeptAuditResultStatusDto;
import org.itcen.domain.audit.dto.DeptImprovementPlanStatusDto;
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

    // ====== Executive Dashboard API ======

    /**
     * 임원 권한 확인
     */
    @GetMapping("/auth/{empId}")
    public ApiResponse<ExecutiveAuthResponseDto> checkExecutiveAuth(@PathVariable String empId) {
        log.debug("임원 권한 확인 요청: empId={}", empId);
        ExecutiveAuthResponseDto result = service.checkExecutiveAuth(empId);
        return ApiResponse.success(result);
    }

    /**
     * 임원 소관부서 목록 조회
     */
    @GetMapping("/departments/{empId}")
    public ApiResponse<List<ExecutiveDepartmentInfoDto>> getExecutiveDepartments(@PathVariable String empId) {
        log.debug("임원 소관부서 조회 요청: empId={}", empId);
        List<ExecutiveDepartmentInfoDto> result = service.getExecutiveDepartments(empId);
        return ApiResponse.success(result);
    }

    /**
     * 임원 소관부서별 점검결과 현황 조회
     */
    @GetMapping("/audit-result-status/{empId}")
    public ApiResponse<List<DeptAuditResultStatusDto>> getExecutiveAuditResultStatus(
            @PathVariable String empId,
            @RequestParam(required = false) Long ledgerOrdersHodId) {
        log.debug("임원 소관부서 점검결과 현황 조회 요청: empId={}, ledgerOrdersHodId={}", empId, ledgerOrdersHodId);
        List<DeptAuditResultStatusDto> result = service.getExecutiveAuditResultStatus(empId, ledgerOrdersHodId);
        return ApiResponse.success(result);
    }

    /**
     * 임원 소관부서별 개선계획 이행 현황 조회
     */
    @GetMapping("/improvement-plan-status/{empId}")
    public ApiResponse<List<DeptImprovementPlanStatusDto>> getExecutiveImprovementPlanStatus(
            @PathVariable String empId,
            @RequestParam(required = false) Long ledgerOrdersHodId) {
        log.debug("임원 소관부서 개선계획 이행 현황 조회 요청: empId={}, ledgerOrdersHodId={}", empId, ledgerOrdersHodId);
        List<DeptImprovementPlanStatusDto> result = service.getExecutiveImprovementPlanStatus(empId, ledgerOrdersHodId);
        return ApiResponse.success(result);
    }
}
