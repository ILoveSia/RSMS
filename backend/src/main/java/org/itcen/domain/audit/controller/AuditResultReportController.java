package org.itcen.domain.audit.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.AuditResultReportDto;
import org.itcen.domain.audit.service.AuditResultReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 점검결과보고 Controller
 * 
 * 단일 책임 원칙(SRP): 점검결과보고 HTTP 요청 처리만 담당
 * 개방-폐쇄 원칙(OCP): 새로운 요청 타입 추가 시 기존 코드 수정 없이 확장 가능
 */
@Slf4j
@RestController
@RequestMapping("/audit-result-report")
@RequiredArgsConstructor
public class AuditResultReportController {

    private final AuditResultReportService auditResultReportService;

    /**
     * 점검결과보고서 등록
     */
    @PostMapping
    public ResponseEntity<AuditResultReportDto> createAuditResultReport(@RequestBody AuditResultReportDto dto) {
        log.debug("점검결과보고서 등록 요청: {}", dto);
        
        AuditResultReportDto result = auditResultReportService.createAuditResultReport(dto);
        
        log.debug("점검결과보고서 등록 응답: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * 점검결과보고서 수정
     */
    @PutMapping("/{auditResultReportId}")
    public ResponseEntity<AuditResultReportDto> updateAuditResultReport(
            @PathVariable Long auditResultReportId,
            @RequestBody AuditResultReportDto dto) {
        log.debug("점검결과보고서 수정 요청: {}, {}", auditResultReportId, dto);
        
        dto.setAuditResultReportId(auditResultReportId);
        AuditResultReportDto result = auditResultReportService.updateAuditResultReport(dto);
        
        log.debug("점검결과보고서 수정 응답: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * 점검결과보고서 상세 조회
     */
    @GetMapping("/{auditResultReportId}")
    public ResponseEntity<AuditResultReportDto> getAuditResultReport(@PathVariable Long auditResultReportId) {
        log.debug("점검결과보고서 상세 조회 요청: {}", auditResultReportId);
        
        AuditResultReportDto result = auditResultReportService.getAuditResultReport(auditResultReportId);
        
        log.debug("점검결과보고서 상세 조회 응답: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * 점검계획관리ID로 결과보고서 조회
     */
    @GetMapping("/by-audit-prog-mngt/{auditProgMngtId}")
    public ResponseEntity<AuditResultReportDto> getAuditResultReportByAuditProgMngtId(@PathVariable Long auditProgMngtId) {
        log.debug("점검계획관리ID로 결과보고서 조회 요청: {}", auditProgMngtId);
        
        AuditResultReportDto result = auditResultReportService.getAuditResultReportByAuditProgMngtId(auditProgMngtId);
        
        log.debug("점검계획관리ID로 결과보고서 조회 응답: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * 점검계획관리ID와 부서코드로 결과보고서 조회
     */
    @GetMapping("/by-audit-prog-mngt/{auditProgMngtId}/dept/{deptCd}")
    public ResponseEntity<AuditResultReportDto> getAuditResultReportByAuditProgMngtIdAndDeptCd(
            @PathVariable Long auditProgMngtId,
            @PathVariable String deptCd) {
        log.debug("점검계획관리ID와 부서코드로 결과보고서 조회 요청: {}, {}", auditProgMngtId, deptCd);
        
        AuditResultReportDto result = auditResultReportService.getAuditResultReportByAuditProgMngtIdAndDeptCd(auditProgMngtId, deptCd);
        
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        
        log.debug("점검계획관리ID와 부서코드로 결과보고서 조회 응답: {}", result);
        return ResponseEntity.ok(result);
    }

    /**
     * 점검계획관리ID로 모든 부서 결과보고서 목록 조회
     */
    @GetMapping("/list/by-audit-prog-mngt/{auditProgMngtId}")
    public ResponseEntity<List<AuditResultReportDto>> getAuditResultReportsByAuditProgMngtId(@PathVariable Long auditProgMngtId) {
        log.debug("점검계획관리ID로 모든 부서 결과보고서 목록 조회 요청: {}", auditProgMngtId);
        
        List<AuditResultReportDto> result = auditResultReportService.getAuditResultReportsByAuditProgMngtId(auditProgMngtId);
        
        log.debug("점검계획관리ID로 모든 부서 결과보고서 목록 조회 응답: {}건", result.size());
        return ResponseEntity.ok(result);
    }

    /**
     * 점검결과보고서 삭제
     */
    @DeleteMapping("/{auditResultReportId}")
    public ResponseEntity<Void> deleteAuditResultReport(@PathVariable Long auditResultReportId) {
        log.debug("점검결과보고서 삭제 요청: {}", auditResultReportId);
        
        auditResultReportService.deleteAuditResultReport(auditResultReportId);
        
        log.debug("점검결과보고서 삭제 완료: {}", auditResultReportId);
        return ResponseEntity.ok().build();
    }
}