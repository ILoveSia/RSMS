package org.itcen.domain.audit.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.audit.dto.DeficiencyStatusDto;
import org.itcen.domain.audit.service.DeficiencyStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 미흡상황 현황 Controller
 * 
 * 단일 책임 원칙(SRP): HTTP 요청/응답 처리만 담당
 * 의존성 역전 원칙(DIP): Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping({"/inquiry/deficiency-status", "/deficiency-status"})
@RequiredArgsConstructor
public class DeficiencyStatusController {

    private final DeficiencyStatusService deficiencyStatusService;

    /**
     * 전체 미흡상황 현황 목록 조회
     * 
     * @param startDate 시작일 (선택적)
     * @param endDate 종료일 (선택적)
     * @return 미흡상황 현황 목록
     */
    @GetMapping("/all")
    public ResponseEntity<List<DeficiencyStatusDto>> getAllDeficiencyStatus(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        log.info("전체 미흡상황 현황 목록 조회 요청 - startDate: {}, endDate: {}", startDate, endDate);
        
        List<DeficiencyStatusDto> statusList = deficiencyStatusService.getAllDeficiencyStatus(startDate, endDate);
        

        
        log.info("전체 미흡상황 현황 목록 조회 완료 - 건수: {}", statusList.size());
        return ResponseEntity.ok(statusList);
    }


    /**
     * 미흡상황 수정
     * 
     * @param id 미흡상황 ID
     * @param dto 미흡상황 데이터
     * @return 수정된 미흡상황 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<DeficiencyStatusDto> updateDeficiencyStatus(
            @PathVariable Long id,
            @RequestBody DeficiencyStatusDto dto) {
        log.info("미흡상황 수정 요청: {}", id);
        
        dto.setAuditProgMngtDetailId(id);
        DeficiencyStatusDto updatedDto = deficiencyStatusService.updateDeficiencyStatus(dto);
        
        log.info("미흡상황 수정 완료: {}", id);
        return ResponseEntity.ok(updatedDto);
    }

    /**
     * 미흡상황 삭제
     * 
     * @param id 미흡상황 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeficiencyStatus(@PathVariable Long id) {
        log.info("미흡상황 삭제 요청: {}", id);
        
        deficiencyStatusService.deleteDeficiencyStatus(id);
        
        log.info("미흡상황 삭제 완료: {}", id);
        return ResponseEntity.ok().build();
    }

    /**
     * 미흡상황 다중 삭제
     * 
     * @param request 삭제할 미흡상황 ID 목록
     * @return 삭제 결과
     */
    @PostMapping("/multiple/delete")
    public ResponseEntity<Void> deleteMultipleDeficiencyStatus(@RequestBody DeleteMultipleRequest request) {
        log.info("미흡상황 다중 삭제 요청: {}", request);
        
        if (request.getIds() == null || request.getIds().isEmpty()) {
            throw new RuntimeException("삭제할 미흡상황 ID가 없습니다.");
        }
        
        for (Long id : request.getIds()) {
            deficiencyStatusService.deleteDeficiencyStatus(id);
        }
        
        log.info("미흡상황 다중 삭제 완료: {}건", request.getIds().size());
        return ResponseEntity.ok().build();
    }

    /**
     * 이행결과 작성
     * 
     * @param request 이행결과 작성 요청
     * @return 작성 결과
     */
    @PostMapping("/implementation-result/update")
    public ResponseEntity<Void> updateImplementationResult(@RequestBody ImplementationResultRequest request) {
        log.info("이행결과 작성 요청: {}", request);
        
        deficiencyStatusService.updateImplementationResult(
                request.getIds(), 
                request.getImplementationResult(), 
                request.getCompletionDate(), 
                request.getStatusCode(), 
                request.getRemarks());
        
        log.info("이행결과 작성 완료: {}건", request.getIds().size());
        return ResponseEntity.ok().build();
    }

    /**
     * 승인 처리
     * 
     * @param request 승인 요청
     * @return 승인 결과
     */
    @PostMapping("/approve")
    public ResponseEntity<Void> approveDeficiencyStatus(@RequestBody ApprovalRequest request) {
        log.info("승인 처리 요청: {}", request);
        
        deficiencyStatusService.approveDeficiencyStatus(
                request.getIds(), 
                request.getApprovalStatus(), 
                request.getApprovalComments());
        
        log.info("승인 처리 완료: {}건", request.getIds().size());
        return ResponseEntity.ok().build();
    }

    /**
     * 점검회차 목록 조회
     * 
     * @return 점검회차 목록
     */
    @GetMapping("/inspection-rounds")
    public ResponseEntity<List<String>> getInspectionRoundList() {
        log.info("점검회차 목록 조회 요청");
        
        List<String> rounds = deficiencyStatusService.getInspectionRoundList();
        
        log.info("점검회차 목록 조회 완료 - 건수: {}", rounds.size());
        return ResponseEntity.ok(rounds);
    }

    /**
     * 부서 목록 조회
     * 
     * @return 부서 목록
     */
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartmentList() {
        log.info("부서 목록 조회 요청");
        
        List<String> departments = deficiencyStatusService.getDepartmentList();
        
        log.info("부서 목록 조회 완료 - 건수: {}", departments.size());
        return ResponseEntity.ok(departments);
    }

    // 내부 클래스들
    public static class DeleteMultipleRequest {
        private List<Long> ids;
        
        public DeleteMultipleRequest() {}
        
        public DeleteMultipleRequest(List<Long> ids) {
            this.ids = ids;
        }
        
        public List<Long> getIds() { return ids; }
        public void setIds(List<Long> ids) { this.ids = ids; }
        
        @Override
        public String toString() {
            return "DeleteMultipleRequest{ids=" + ids + "}";
        }
    }

    public static class ImprovementPlanUpdateRequest {
        private List<Long> ids;
        private String improvementPlan;
        private String dueDate;
        private String remarks;
        
        public ImprovementPlanUpdateRequest() {}
        
        // Getters and Setters
        public List<Long> getIds() { return ids; }
        public void setIds(List<Long> ids) { this.ids = ids; }
        public String getImprovementPlan() { return improvementPlan; }
        public void setImprovementPlan(String improvementPlan) { this.improvementPlan = improvementPlan; }
        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        
        @Override
        public String toString() {
            return "ImprovementPlanUpdateRequest{ids=" + ids + ", improvementPlan='" + improvementPlan + "'}";
        }
    }

    public static class ImplementationResultRequest {
        private List<Long> ids;
        private String implementationResult;
        private String completionDate;
        private String statusCode;
        private String remarks;
        
        public ImplementationResultRequest() {}
        
        // Getters and Setters
        public List<Long> getIds() { return ids; }
        public void setIds(List<Long> ids) { this.ids = ids; }
        public String getImplementationResult() { return implementationResult; }
        public void setImplementationResult(String implementationResult) { this.implementationResult = implementationResult; }
        public String getCompletionDate() { return completionDate; }
        public void setCompletionDate(String completionDate) { this.completionDate = completionDate; }
        public String getStatusCode() { return statusCode; }
        public void setStatusCode(String statusCode) { this.statusCode = statusCode; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        
        @Override
        public String toString() {
            return "ImplementationResultRequest{ids=" + ids + ", implementationResult='" + implementationResult + "'}";
        }
    }

    public static class ApprovalRequest {
        private List<Long> ids;
        private String approvalStatus;
        private String approvalComments;
        
        public ApprovalRequest() {}
        
        // Getters and Setters
        public List<Long> getIds() { return ids; }
        public void setIds(List<Long> ids) { this.ids = ids; }
        public String getApprovalStatus() { return approvalStatus; }
        public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
        public String getApprovalComments() { return approvalComments; }
        public void setApprovalComments(String approvalComments) { this.approvalComments = approvalComments; }
        
        @Override
        public String toString() {
            return "ApprovalRequest{ids=" + ids + ", approvalStatus='" + approvalStatus + "'}";
        }
    }
}