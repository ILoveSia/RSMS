package org.itcen.domain.audit.controller;

import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.audit.dto.AuditorDto;
import org.itcen.domain.audit.service.AuditorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 점검자 컨트롤러
 * 점검자 조회 및 지정 관련 REST API 엔드포인트 제공
 */
@Slf4j
@RestController
@RequestMapping("/auditors")
@RequiredArgsConstructor
public class AuditorController {

    private final AuditorService auditorService;

    /**
     * 점검자 검색 (상세 조건)
     * 
     * @param searchRequest 검색 조건
     * @return 점검자 목록
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<AuditorDto.AuditorInfoResponse>>> searchAuditors(
            @RequestBody AuditorDto.AuditorSearchRequest searchRequest) {
        
        log.debug("점검자 검색 요청: {}", searchRequest);
        
        List<AuditorDto.AuditorInfoResponse> auditors = auditorService.searchAuditors(searchRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("점검자 검색 완료", auditors)
        );
    }

    /**
     * 성명으로 점검자 검색 (간단 검색)
     * 
     * @param empName 성명 (부분일치)
     * @return 점검자 목록
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AuditorDto.AuditorInfoResponse>>> searchAuditorsByName(
            @RequestParam(required = false) String empName) {
        
        log.debug("성명으로 점검자 검색: {}", empName);
        
        List<AuditorDto.AuditorInfoResponse> auditors;
        
        if (empName != null && !empName.trim().isEmpty()) {
            auditors = auditorService.searchAuditorsByName(empName.trim());
        } else {
            // 전체 조회
            auditors = auditorService.searchAuditors(
                AuditorDto.AuditorSearchRequest.builder()
                    .useYn("Y")
                    .build()
            );
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("점검자 조회 완료", auditors)
        );
    }

    /**
     * 점검자 지정
     * 
     * @param assignmentRequest 점검자 지정 요청
     * @return 점검자 지정 결과
     */
    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<AuditorDto.AuditorAssignmentResponse>> assignAuditor(
            @Valid @RequestBody AuditorDto.AuditorAssignmentRequest assignmentRequest) {
        
        log.debug("점검자 지정 요청: {}", assignmentRequest);
        
        AuditorDto.AuditorAssignmentResponse result = auditorService.assignAuditor(assignmentRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("점검자 지정 완료", result)
        );
    }
}