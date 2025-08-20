package org.itcen.domain.audit.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.AuditItemStatusResponseDto;
import org.itcen.domain.audit.dto.AuditProgMngtDto;
import org.itcen.domain.audit.dto.DeptAuditResultStatusDto;
import org.itcen.domain.audit.dto.DeptImprovementPlanStatusDto;
import org.itcen.domain.audit.service.AuditProgMngtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 점검계획관리 Controller
 * 
 * 단일 책임 원칙(SRP): HTTP 요청/응답 처리만 담당
 * 의존성 역전 원칙(DIP): Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping({"/inquiry/audit-prog-mngt", "/audit-prog-mngt"})
@RequiredArgsConstructor
public class AuditProgMngtController {

    private final AuditProgMngtService auditProgMngtService;

    /**
     * 점검계획 등록
     * 
     * @param dto 점검계획 데이터
     * @return 등록된 점검계획 정보
     */
    @PostMapping
    public ResponseEntity<AuditProgMngtDto> createAuditProgMngt(@RequestBody AuditProgMngtDto dto) {
        log.info("점검계획 등록 요청: {}", dto);
        
        AuditProgMngtDto savedDto = auditProgMngtService.createAuditProgMngt(dto);
        
        log.info("점검계획 등록 완료: {}", savedDto.getAuditProgMngtCd());
        return ResponseEntity.ok(savedDto);
    }

    /**
     * 점검계획 수정
     * 
     * @param auditProgMngtCd 점검계획코드
     * @param dto 점검계획 데이터
     * @return 수정된 점검계획 정보
     */
    @PutMapping("/{auditProgMngtCd}")
    public ResponseEntity<AuditProgMngtDto> updateAuditProgMngt(
            @PathVariable String auditProgMngtCd,
            @RequestBody AuditProgMngtDto dto) {
        log.info("점검계획 수정 요청: {}", auditProgMngtCd);
        
        dto.setAuditProgMngtCd(auditProgMngtCd);
        AuditProgMngtDto updatedDto = auditProgMngtService.updateAuditProgMngt(dto);
        
        log.info("점검계획 수정 완료: {}", auditProgMngtCd);
        return ResponseEntity.ok(updatedDto);
    }

    /**
     * 점검계획 조회
     * 
     * @param auditProgMngtCd 점검계획코드
     * @return 점검계획 정보
     */
    @GetMapping("/{auditProgMngtCd}")
    public ResponseEntity<AuditProgMngtDto> getAuditProgMngt(@PathVariable String auditProgMngtCd) {
        log.info("점검계획 조회 요청: {}", auditProgMngtCd);
        
        AuditProgMngtDto dto = auditProgMngtService.getAuditProgMngt(auditProgMngtCd);
        
        log.info("점검계획 조회 완료: {}", auditProgMngtCd);
        return ResponseEntity.ok(dto);
    }

    /**
     * 점검계획 삭제
     * 
     * @param auditProgMngtCd 점검계획코드
     * @return 삭제 결과
     */
    @DeleteMapping("/{auditProgMngtCd}")
    public ResponseEntity<Void> deleteAuditProgMngt(@PathVariable String auditProgMngtCd) {
        log.info("점검계획 삭제 요청: {}", auditProgMngtCd);
        
        auditProgMngtService.deleteAuditProgMngt(auditProgMngtCd);
        
        log.info("점검계획 삭제 완료: {}", auditProgMngtCd);
        return ResponseEntity.ok().build();
    }

    /**
     * 점검계획 다중 삭제
     * 
     * @param request 삭제할 점검계획코드 목록
     * @return 삭제 결과
     */
    @PostMapping("/multiple/delete")
    public ResponseEntity<Void> deleteMultipleAuditProgMngt(
            @RequestBody DeleteMultipleRequest request,
            HttpServletRequest httpRequest) {
        log.info("점검계획 다중 삭제 요청: {}", request);
        log.info("요청 객체 상세: request={}, auditProgMngtCds={}", request, request.getAuditProgMngtCds());
        log.info("Content-Type: {}", httpRequest.getContentType());
        
        if (request.getAuditProgMngtCds() == null || request.getAuditProgMngtCds().isEmpty()) {
            throw new RuntimeException("삭제할 점검계획 코드가 없습니다.");
        }
        
        for (String auditProgMngtCd : request.getAuditProgMngtCds()) {
            auditProgMngtService.deleteAuditProgMngt(auditProgMngtCd);
        }
        
        log.info("점검계획 다중 삭제 완료: {}건", request.getAuditProgMngtCds().size());
        return ResponseEntity.ok().build();
    }

    /**
     * 다중 삭제 요청 DTO
     */
    public static class DeleteMultipleRequest {
        private List<String> auditProgMngtCds;
        
        public DeleteMultipleRequest() {
            // 기본 생성자 (Jackson 역직렬화용)
        }
        
        public DeleteMultipleRequest(List<String> auditProgMngtCds) {
            this.auditProgMngtCds = auditProgMngtCds;
        }
        
        public List<String> getAuditProgMngtCds() {
            return auditProgMngtCds;
        }
        
        public void setAuditProgMngtCds(List<String> auditProgMngtCds) {
            this.auditProgMngtCds = auditProgMngtCds;
        }
        
        @Override
        public String toString() {
            return "DeleteMultipleRequest{auditProgMngtCds=" + auditProgMngtCds + "}";
        }
    }

    /**
     * 점검계획관리 현황 목록 조회 (전체)
     * 
     * @param startDate 시작일 (선택적)
     * @param endDate 종료일 (선택적)
     * @return 점검계획관리 현황 목록
     */
    @GetMapping("/status/all")
    public ResponseEntity<List<AuditProgMngtDto>> getAllAuditProgMngtStatus(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("점검계획관리 현황 목록 조회 요청 - startDate: {}, endDate: {}", startDate, endDate);
        
        List<AuditProgMngtDto> statusList = auditProgMngtService.getAllAuditProgMngtStatus(startDate, endDate);
        
        log.info("점검계획관리 현황 목록 조회 완료 - 건수: {}", statusList.size());
        return ResponseEntity.ok(statusList);
    }

    /**
     * 점검계획관리 현황 조회 (파라미터 기반)
     * 
     * @param auditTypeCd 점검유형코드 (선택적)
     * @param auditStatusCd 점검상태코드 (선택적)
     * @param auditTeamLeader 점검팀장 (선택적)
     * @param startDate 시작일 (선택적)
     * @param endDate 종료일 (선택적)
     * @return 점검계획관리 현황 목록
     */
    @GetMapping("/status")
    public ResponseEntity<List<AuditProgMngtDto>> getAuditProgMngtStatus(
            @RequestParam(required = false) String auditTypeCd,
            @RequestParam(required = false) String auditStatusCd,
            @RequestParam(required = false) String auditTeamLeader,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("점검계획관리 현황 조회 요청 - auditTypeCd: {}, auditStatusCd: {}, auditTeamLeader: {}", 
                auditTypeCd, auditStatusCd, auditTeamLeader);
        
        List<AuditProgMngtDto> statusList = auditProgMngtService.getAuditProgMngtStatus(
                auditTypeCd, auditStatusCd, auditTeamLeader, startDate, endDate);
        
        log.info("점검계획관리 현황 조회 완료 - 건수: {}", statusList.size());
        return ResponseEntity.ok(statusList);
    }

    /**
     * 점검 현황(항목별) 조회 API
     * 
     * audit_prog_mngt와 audit_prog_mngt_detail 조인 후
     * hod_ic_item과 responsibility, positions 조인
     * role_resp_status는 left outer 조인
     * 
     * @param ledgerOrdersHod 원장차수 (조회조건, 선택적)
     * @param auditResultStatusCd 점검결과 (조회조건, 선택적)
     * @return 점검 현황(항목별) 목록
     */
    @GetMapping("/item-status")
    public ResponseEntity<List<AuditItemStatusResponseDto>> getAuditItemStatus(
            @RequestParam(required = false) Long ledgerOrdersHod,
            @RequestParam(required = false) String auditResultStatusCd) {
        log.info("점검 현황(항목별) 조회 요청 - ledgerOrdersHod: {}, auditResultStatusCd: {}", 
                ledgerOrdersHod, auditResultStatusCd);
        
        List<AuditItemStatusResponseDto> itemStatusList = auditProgMngtService.getAuditItemStatus(
                ledgerOrdersHod, auditResultStatusCd);
        
        log.info("점검 현황(항목별) 조회 완료 - 건수: {}", itemStatusList.size());
        return ResponseEntity.ok(itemStatusList);
    }

    /**
     * 결재 승인 시 점검계획관리상세 상태 업데이트 API
     * 
     * @param auditProgMngtDetailId 점검계획관리상세 ID
     * @return 업데이트 결과
     */
    @PutMapping("/detail/{auditProgMngtDetailId}/approve")
    public ResponseEntity<Map<String, Object>> updateImpPlStatusToPLI03(
            @PathVariable Long auditProgMngtDetailId) {
        log.info("점검계획관리상세 결재 승인 요청 - auditProgMngtDetailId: {}", auditProgMngtDetailId);
        
        try {
            int updatedCount = auditProgMngtService.updateImpPlStatusToPLI03(auditProgMngtDetailId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", updatedCount > 0);
            response.put("updatedCount", updatedCount);
            response.put("message", updatedCount > 0 ? 
                "개선계획상태코드가 PLI03(계획결재완료)으로, 점검최종결과여부가 'Y'로 업데이트되었습니다." : 
                "업데이트할 데이터를 찾을 수 없습니다.");
            
            log.info("점검계획관리상세 결재 승인 완료 - auditProgMngtDetailId: {}, 업데이트된 레코드 수: {}", 
                    auditProgMngtDetailId, updatedCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("점검계획관리상세 결재 승인 실패 - auditProgMngtDetailId: {}, 오류: {}", 
                    auditProgMngtDetailId, e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "결재 승인 처리 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 부서별 점검결과 현황 조회 API
     * 
     * @param ledgerOrdersId 원장차수 ID (조회조건, 선택적)
     * @param deptCd 부서코드 (조회조건, 선택적)
     * @return 부서별 점검결과 현황 목록
     */
    @GetMapping("/dept-audit-result-status")
    public ResponseEntity<List<DeptAuditResultStatusDto>> getDeptAuditResultStatus(
            @RequestParam(required = false) Long ledgerOrdersId,
            @RequestParam(required = false) String deptCd) {
        log.info("부서별 점검결과 현황 조회 요청 - ledgerOrdersId: {}, deptCd: {}", ledgerOrdersId, deptCd);
        
        List<DeptAuditResultStatusDto> deptStatusList = auditProgMngtService.getDeptAuditResultStatus(ledgerOrdersId, deptCd);
        
        log.info("부서별 점검결과 현황 조회 완료 - 건수: {}", deptStatusList.size());
        return ResponseEntity.ok(deptStatusList);
    }

    /**
     * 부서별 개선계획등록 현황 조회 API
     * 
     * @param ledgerOrdersId 원장차수 ID (조회조건, 선택적)
     * @param deptCd 부서코드 (조회조건, 선택적)
     * @return 부서별 개선계획등록 현황 목록
     */
    @GetMapping("/dept-improvement-plan-status")
    public ResponseEntity<List<DeptImprovementPlanStatusDto>> getDeptImprovementPlanStatus(
            @RequestParam(required = false) Long ledgerOrdersId,
            @RequestParam(required = false) String deptCd) {
        log.info("부서별 개선계획등록 현황 조회 요청 - ledgerOrdersId: {}, deptCd: {}", ledgerOrdersId, deptCd);
        
        List<DeptImprovementPlanStatusDto> deptStatusList = auditProgMngtService.getDeptImprovementPlanStatus(ledgerOrdersId, deptCd);
        
        log.info("부서별 개선계획등록 현황 조회 완료 - 건수: {}", deptStatusList.size());
        return ResponseEntity.ok(deptStatusList);
    }
}