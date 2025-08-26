package org.itcen.domain.handover.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.entity.InternalControlManual;
import org.itcen.domain.handover.service.InternalControlManualService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 내부통제 업무메뉴얼 컨트롤러
 * 내부통제 업무메뉴얼 관련 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 메뉴얼 API 엔드포인트만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: Spring MVC 컨트롤러 규약 준수
 * - Interface Segregation: 내부통제 메뉴얼 관련 API만 제공
 * - Dependency Inversion: InternalControlManualService 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/handover/manuals")
@RequiredArgsConstructor
public class InternalControlManualController {

    private final InternalControlManualService internalControlManualService;

    /**
     * 내부통제 메뉴얼 생성
     */
    @PostMapping
    public ResponseEntity<InternalControlManual> createManual(@RequestBody InternalControlManual manual) {
        log.debug("내부통제 메뉴얼 생성 요청 - deptCd: {}, title: {}", 
                  manual.getDeptCd(), manual.getManualTitle());
        
        InternalControlManual created = internalControlManualService.createManual(manual);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 내부통제 메뉴얼 수정
     */
    @PutMapping("/{manualId}")
    public ResponseEntity<InternalControlManual> updateManual(
            @PathVariable Long manualId,
            @RequestBody InternalControlManual manual) {
        log.debug("내부통제 메뉴얼 수정 요청 - manualId: {}", manualId);
        
        InternalControlManual updated = internalControlManualService.updateManual(manualId, manual);
        return ResponseEntity.ok(updated);
    }

    /**
     * 내부통제 메뉴얼 조회
     */
    @GetMapping("/{manualId}")
    public ResponseEntity<InternalControlManual> getManual(@PathVariable Long manualId) {
        log.debug("내부통제 메뉴얼 조회 요청 - manualId: {}", manualId);
        
        return internalControlManualService.getManual(manualId)
                .map(manual -> ResponseEntity.ok(manual))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 내부통제 메뉴얼 삭제
     */
    @DeleteMapping("/{manualId}")
    public ResponseEntity<Void> deleteManual(@PathVariable Long manualId) {
        log.debug("내부통제 메뉴얼 삭제 요청 - manualId: {}", manualId);
        
        internalControlManualService.deleteManual(manualId);
        return ResponseEntity.noContent().build();
    }


    

    /**
     * 메뉴얼 발행
     */
    @PostMapping("/{manualId}/publish")
    public ResponseEntity<Void> publishManual(
            @PathVariable Long manualId,
            @RequestParam String actorEmpNo) {
        log.debug("메뉴얼 발행 요청 - manualId: {}", manualId);
        
        internalControlManualService.publishManual(manualId, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 메뉴얼 버전 업데이트
     */
    @PostMapping("/{manualId}/version")
    public ResponseEntity<InternalControlManual> updateVersion(
            @PathVariable Long manualId,
            @RequestParam String newVersion,
            @RequestParam String actorEmpNo) {
        log.debug("버전 업데이트 요청 - manualId: {}, newVersion: {}", manualId, newVersion);
        
        InternalControlManual updated = internalControlManualService.updateVersion(manualId, newVersion, actorEmpNo);
        return ResponseEntity.ok(updated);
    }



    /**
     * 부서별 내부통제 메뉴얼 조회
     */
    @GetMapping("/department/{deptCd}")
    public ResponseEntity<List<InternalControlManualService.InternalControlManualDto>> getManualsByDepartment(
            @PathVariable String deptCd) {
        log.debug("부서별 내부통제 메뉴얼 조회 요청 - deptCd: {}", deptCd);
        
        List<InternalControlManualService.InternalControlManualDto> manuals = 
                internalControlManualService.getManualsByDepartment(deptCd);
        return ResponseEntity.ok(manuals);
    }

    /**
     * 작성자별 내부통제 메뉴얼 조회
     */
    @GetMapping("/author/{authorEmpNo}")
    public ResponseEntity<List<InternalControlManualService.InternalControlManualDto>> getManualsByAuthor(
            @PathVariable String authorEmpNo) {
        log.debug("작성자별 내부통제 메뉴얼 조회 요청 - authorEmpNo: {}", authorEmpNo);
        
        List<InternalControlManualService.InternalControlManualDto> manuals = 
                internalControlManualService.getManualsByAuthor(authorEmpNo);
        return ResponseEntity.ok(manuals);
    }

    /**
     * 유효한 메뉴얼 조회
     */
    @GetMapping("/valid")
    public ResponseEntity<List<InternalControlManualService.InternalControlManualDto>> getValidManuals() {
        log.debug("유효한 메뉴얼 조회 요청");
        
        List<InternalControlManualService.InternalControlManualDto> manuals = 
                internalControlManualService.getValidManuals();
        return ResponseEntity.ok(manuals);
    }


    /**
     * 승인 대기중인 메뉴얼 조회
     */
    @GetMapping("/pending-approval")
    public ResponseEntity<List<InternalControlManualService.InternalControlManualDto>> getPendingApprovalManuals() {
        log.debug("승인 대기중인 메뉴얼 조회 요청");
        
        List<InternalControlManualService.InternalControlManualDto> manuals = 
                internalControlManualService.getPendingApprovalManuals();
        return ResponseEntity.ok(manuals);
    }

    

    /**
     * 복합 조건 검색
     */
    @PostMapping("/search")
    public ResponseEntity<Page<InternalControlManualService.InternalControlManualDto>> searchManuals(
            @RequestBody org.itcen.domain.handover.dto.ManualSearchDto searchDto,
            @PageableDefault Pageable pageable) {
        log.debug("복합 조건 검색 요청 - searchDto: {}", searchDto);
        
        Page<InternalControlManualService.InternalControlManualDto> manuals = 
                internalControlManualService.searchManuals(searchDto, pageable);
        return ResponseEntity.ok(manuals);
    }

    // 결재 연동 API 엔드포인트들

    /**
     * 결재 테이블과 조인하여 메뉴얼 검색
     */
    @PostMapping("/search-with-approval")
    public ResponseEntity<Page<InternalControlManualService.InternalControlManualWithApprovalDto>> searchManualsWithApproval(
            @RequestBody org.itcen.domain.handover.dto.ManualSearchDto searchDto,
            @PageableDefault Pageable pageable) {
        log.debug("결재 연동 검색 요청 - searchDto: {}", searchDto);
        
        Page<InternalControlManualService.InternalControlManualWithApprovalDto> manuals = 
                internalControlManualService.searchManualsWithApproval(searchDto, pageable);
        return ResponseEntity.ok(manuals);
    }

    /**
     * 결재 요청 시작
     */
    @PostMapping("/{manualId}/approval/start")
    public ResponseEntity<Void> startApproval(
            @PathVariable Long manualId,
            @RequestBody org.itcen.domain.handover.dto.ApprovalStartRequestDto request) {
        log.debug("결재 요청 시작 - manualId: {}", manualId);
        
        internalControlManualService.startApproval(manualId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 승인
     */
    @PostMapping("/{manualId}/approval/approve")
    public ResponseEntity<Void> approveApproval(
            @PathVariable Long manualId,
            @RequestParam String comment) {
        log.debug("결재 승인 - manualId: {}, comment: {}", manualId, comment);
        
        internalControlManualService.approveApproval(manualId, comment);
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 반려
     */
    @PostMapping("/{manualId}/approval/reject")
    public ResponseEntity<Void> rejectApproval(
            @PathVariable Long manualId,
            @RequestParam String reason) {
        log.debug("결재 반려 - manualId: {}, reason: {}", manualId, reason);
        
        internalControlManualService.rejectApproval(manualId, reason);
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 취소
     */
    @PostMapping("/{manualId}/approval/cancel")
    public ResponseEntity<Void> cancelApproval(@PathVariable Long manualId) {
        log.debug("결재 취소 - manualId: {}", manualId);
        
        internalControlManualService.cancelApproval(manualId);
        return ResponseEntity.ok().build();
    }
}