package org.itcen.domain.audit.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.AuditResultDetailRequestDto;
import org.itcen.domain.audit.dto.AuditResultDetailResponseDto;
import org.itcen.domain.audit.dto.AuditResultSaveRequestDto;
import org.itcen.domain.audit.dto.AuditResultSaveResponseDto;
import org.itcen.domain.audit.dto.ImplementationResultUpdateRequestDto;
import org.itcen.domain.audit.dto.ImplementationResultUpdateResponseDto;
import org.itcen.domain.audit.service.AuditResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 점검결과 Controller
 * 
 * 단일 책임 원칙(SRP): HTTP 요청/응답 처리만 담당
 * 의존성 역전 원칙(DIP): Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/inquiry/audit-result")
@RequiredArgsConstructor
public class AuditResultController {

    private final AuditResultService auditResultService;

    /**
     * 점검결과 저장
     * 
     * @param request 점검결과 저장 요청 데이터
     * @return 저장 결과
     */
    @PostMapping("/save")
    public ResponseEntity<AuditResultSaveResponseDto> saveAuditResult(
            @RequestBody AuditResultSaveRequestDto request) {
        log.info("점검결과 저장 요청 - 항목수: {}, 첨부파일수: {}", 
                request.getAuditProgMngtDetailIds().size(), 
                request.getAttachments().size());
        
        AuditResultSaveResponseDto response = auditResultService.saveAuditResult(request);
        
        log.info("점검결과 저장 완료 - 업데이트된 항목수: {}, 첨부파일ID: {}", 
                response.getUpdatedCount(), response.getAttachmentIds());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 점검결과 수정
     * 
     * @param request 점검결과 수정 요청 데이터
     * @return 수정 결과
     */
    @PutMapping("/update")
    public ResponseEntity<AuditResultSaveResponseDto> updateAuditResult(
            @RequestBody AuditResultSaveRequestDto request) {
        log.info("점검결과 수정 요청 - 항목수: {}, 첨부파일수: {}", 
                request.getAuditProgMngtDetailIds().size(), 
                request.getAttachments().size());
        
        AuditResultSaveResponseDto response = auditResultService.updateAuditResult(request);
        
        log.info("점검결과 수정 완료 - 업데이트된 항목수: {}, 첨부파일ID: {}", 
                response.getUpdatedCount(), response.getAttachmentIds());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 점검결과 상세 조회
     * 
     * @param request 점검결과 상세 조회 요청 데이터
     * @return 조회 결과
     */
    @PostMapping("/detail")
    public ResponseEntity<List<AuditResultDetailResponseDto>> getAuditResultDetail(
            @RequestBody AuditResultDetailRequestDto request) {
        log.info("점검결과 상세 조회 요청 - 항목수: {}", 
                request.getAuditProgMngtDetailIds().size());
        
        List<AuditResultDetailResponseDto> response = auditResultService.getAuditResultDetail(request);
        
        log.info("점검결과 상세 조회 완료 - 조회된 항목수: {}", response.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 이행결과 업데이트
     * 
     * @param request 이행결과 업데이트 요청 데이터
     * @return 업데이트 결과
     */
    @PutMapping("/implementation-result")
    public ResponseEntity<ImplementationResultUpdateResponseDto> updateImplementationResult(
            @RequestBody ImplementationResultUpdateRequestDto request) {
        log.info("이행결과 업데이트 요청 - auditProgMngtDetailId: {}", 
                request.getAuditProgMngtDetailId());
        
        ImplementationResultUpdateResponseDto response = auditResultService.updateImplementationResult(request);
        
        log.info("이행결과 업데이트 완료 - success: {}, impPlStatusCd: {}", 
                response.isSuccess(), response.getImpPlStatusCd());
        
        return ResponseEntity.ok(response);
    }
}