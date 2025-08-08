package org.itcen.domain.handover.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.entity.BusinessPlanInspection;
import org.itcen.domain.handover.service.BusinessPlanInspectionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 사업계획 점검 컨트롤러
 * 사업계획 점검 관련 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 API 엔드포인트만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: Spring MVC 컨트롤러 규약 준수
 * - Interface Segregation: 사업계획 점검 관련 API만 제공
 * - Dependency Inversion: BusinessPlanInspectionService 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/handover/inspections")
@RequiredArgsConstructor
public class BusinessPlanInspectionController {

    private final BusinessPlanInspectionService businessPlanInspectionService;

    /**
     * 사업계획 점검 생성
     */
    @PostMapping
    public ResponseEntity<BusinessPlanInspection> createInspection(@RequestBody BusinessPlanInspection inspection) {
        log.debug("사업계획 점검 생성 요청 - deptCd: {}, year: {}, quarter: {}", 
                  inspection.getDeptCd(), inspection.getInspectionYear(), inspection.getInspectionQuarter());
        
        BusinessPlanInspection created = businessPlanInspectionService.createInspection(inspection);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 사업계획 점검 수정
     */
    @PutMapping("/{inspectionId}")
    public ResponseEntity<BusinessPlanInspection> updateInspection(
            @PathVariable Long inspectionId,
            @RequestBody BusinessPlanInspection inspection) {
        log.debug("사업계획 점검 수정 요청 - inspectionId: {}", inspectionId);
        
        BusinessPlanInspection updated = businessPlanInspectionService.updateInspection(inspectionId, inspection);
        return ResponseEntity.ok(updated);
    }

    /**
     * 사업계획 점검 조회
     */
    @GetMapping("/{inspectionId}")
    public ResponseEntity<BusinessPlanInspection> getInspection(@PathVariable Long inspectionId) {
        log.debug("사업계획 점검 조회 요청 - inspectionId: {}", inspectionId);
        
        return businessPlanInspectionService.getInspection(inspectionId)
                .map(inspection -> ResponseEntity.ok(inspection))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 사업계획 점검 삭제
     */
    @DeleteMapping("/{inspectionId}")
    public ResponseEntity<Void> deleteInspection(@PathVariable Long inspectionId) {
        log.debug("사업계획 점검 삭제 요청 - inspectionId: {}", inspectionId);
        
        businessPlanInspectionService.deleteInspection(inspectionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 모든 사업계획 점검 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<BusinessPlanInspection>> getAllInspections(@PageableDefault Pageable pageable) {
        log.debug("모든 사업계획 점검 조회 요청 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<BusinessPlanInspection> inspections = businessPlanInspectionService.getAllInspections(pageable);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 모든 사업계획 점검 조회 (리스트 형태) - 프론트엔드용
     */
    @GetMapping("/list")
    public ResponseEntity<Page<BusinessPlanInspection>> getAllInspectionsList(@PageableDefault Pageable pageable) {
        log.debug("모든 사업계획 점검 목록 조회 요청");
        
        // 실제 데이터베이스에서 데이터 조회
        Page<BusinessPlanInspection> inspections = businessPlanInspectionService.getAllInspections(pageable);
        return ResponseEntity.ok(inspections);
    }



    /**
     * 점검 시작
     */
    @PostMapping("/{inspectionId}/start")
    public ResponseEntity<Void> startInspection(
            @PathVariable Long inspectionId,
            @RequestParam String inspectorEmpNo,
            @RequestParam String actorEmpNo) {
        log.debug("점검 시작 요청 - inspectionId: {}, inspectorEmpNo: {}", inspectionId, inspectorEmpNo);
        
        businessPlanInspectionService.startInspection(inspectionId, inspectorEmpNo, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 점검 완료
     */
    @PostMapping("/{inspectionId}/complete")
    public ResponseEntity<Void> completeInspection(
            @PathVariable Long inspectionId,
            @RequestParam String actorEmpNo) {
        log.debug("점검 완료 요청 - inspectionId: {}", inspectionId);
        
        businessPlanInspectionService.completeInspection(inspectionId, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 점검 취소
     */
    @PostMapping("/{inspectionId}/cancel")
    public ResponseEntity<Void> cancelInspection(
            @PathVariable Long inspectionId,
            @RequestParam String actorEmpNo,
            @RequestParam(required = false) String reason) {
        log.debug("점검 취소 요청 - inspectionId: {}, reason: {}", inspectionId, reason);
        
        businessPlanInspectionService.cancelInspection(inspectionId, actorEmpNo, reason);
        return ResponseEntity.ok().build();
    }

    /**
     * 개선사항 등록
     */
    @PostMapping("/{inspectionId}/improvements")
    public ResponseEntity<Void> addImprovementItems(
            @PathVariable Long inspectionId,
            @RequestParam String items,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam String actorEmpNo) {
        log.debug("개선사항 등록 요청 - inspectionId: {}, dueDate: {}", inspectionId, dueDate);
        
        businessPlanInspectionService.addImprovementItems(inspectionId, items, dueDate, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 개선사항 진행 시작
     */
    @PostMapping("/{inspectionId}/improvements/start")
    public ResponseEntity<Void> startImprovement(
            @PathVariable Long inspectionId,
            @RequestParam String actorEmpNo) {
        log.debug("개선사항 진행 시작 요청 - inspectionId: {}", inspectionId);
        
        businessPlanInspectionService.startImprovement(inspectionId, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 개선사항 완료
     */
    @PostMapping("/{inspectionId}/improvements/complete")
    public ResponseEntity<Void> completeImprovement(
            @PathVariable Long inspectionId,
            @RequestParam String actorEmpNo) {
        log.debug("개선사항 완료 요청 - inspectionId: {}", inspectionId);
        
        businessPlanInspectionService.completeImprovement(inspectionId, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 부서별 사업계획 점검 조회
     */
    @GetMapping("/department/{deptCd}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByDepartment(
            @PathVariable String deptCd) {
        log.debug("부서별 사업계획 점검 조회 요청 - deptCd: {}", deptCd);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByDepartment(deptCd);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 점검 연도별 조회
     */
    @GetMapping("/year/{inspectionYear}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByYear(
            @PathVariable Integer inspectionYear) {
        log.debug("연도별 점검 조회 요청 - year: {}", inspectionYear);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByYear(inspectionYear);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 점검 연도와 분기별 조회
     */
    @GetMapping("/year/{inspectionYear}/quarter/{inspectionQuarter}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByYearAndQuarter(
            @PathVariable Integer inspectionYear,
            @PathVariable Integer inspectionQuarter) {
        log.debug("연도/분기별 점검 조회 요청 - year: {}, quarter: {}", inspectionYear, inspectionQuarter);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByYearAndQuarter(inspectionYear, inspectionQuarter);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 점검 유형별 조회
     */
    @GetMapping("/type/{inspectionType}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByType(
            @PathVariable BusinessPlanInspection.InspectionType inspectionType) {
        log.debug("유형별 점검 조회 요청 - type: {}", inspectionType);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByType(inspectionType);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 상태별 점검 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByStatus(
            @PathVariable BusinessPlanInspection.InspectionStatus status) {
        log.debug("상태별 점검 조회 요청 - status: {}", status);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByStatus(status);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 점검자별 점검 조회
     */
    @GetMapping("/inspector/{inspectorEmpNo}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByInspector(
            @PathVariable String inspectorEmpNo) {
        log.debug("점검자별 점검 조회 요청 - inspectorEmpNo: {}", inspectorEmpNo);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByInspector(inspectorEmpNo);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 피점검자별 점검 조회
     */
    @GetMapping("/inspectee/{inspecteeEmpNo}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByInspectee(
            @PathVariable String inspecteeEmpNo) {
        log.debug("피점검자별 점검 조회 요청 - inspecteeEmpNo: {}", inspecteeEmpNo);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByInspectee(inspecteeEmpNo);
        return ResponseEntity.ok(inspections);
    }



    /**
     * 부서와 연도별 점검 조회
     */
    @GetMapping("/department/{deptCd}/year/{year}")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByDepartmentAndYear(
            @PathVariable String deptCd,
            @PathVariable Integer year) {
        log.debug("부서/연도별 점검 조회 요청 - deptCd: {}, year: {}", deptCd, year);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByDepartmentAndYear(deptCd, year);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 특정 부서의 최신 점검 조회
     */
    @GetMapping("/department/{deptCd}/latest")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getLatestInspectionsByDepartment(
            @PathVariable String deptCd,
            @RequestParam(defaultValue = "10") int limit) {
        log.debug("부서 최신 점검 조회 요청 - deptCd: {}, limit: {}", deptCd, limit);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getLatestInspectionsByDepartment(deptCd, limit);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 특정 기간 내 계획된 점검 조회
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getInspectionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("기간별 점검 조회 요청 - startDate: {}, endDate: {}", startDate, endDate);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getInspectionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 지연된 점검 조회
     */
    @GetMapping("/delayed")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getDelayedInspections() {
        log.debug("지연된 점검 조회 요청");
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getDelayedInspections();
        return ResponseEntity.ok(inspections);
    }

    /**
     * 개선사항 기한 임박 점검 조회
     */
    @GetMapping("/improvements/due-soon")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getImprovementsDueSoon(
            @RequestParam(defaultValue = "7") int daysFromNow) {
        log.debug("개선사항 기한 임박 점검 조회 요청 - daysFromNow: {}", daysFromNow);
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getImprovementsDueSoon(daysFromNow);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 개선사항 지연 점검 조회
     */
    @GetMapping("/improvements/overdue")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getOverdueImprovements() {
        log.debug("개선사항 지연 점검 조회 요청");
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getOverdueImprovements();
        return ResponseEntity.ok(inspections);
    }

    /**
     * 진행중인 점검 조회
     */
    @GetMapping("/active")
    public ResponseEntity<List<BusinessPlanInspectionService.BusinessPlanInspectionDto>> getActiveInspections() {
        log.debug("진행중인 점검 조회 요청");
        
        List<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.getActiveInspections();
        return ResponseEntity.ok(inspections);
    }

    /**
     * 복합 조건 검색
     */
    @PostMapping("/search")
    public ResponseEntity<Page<BusinessPlanInspectionService.BusinessPlanInspectionDto>> searchInspections(
            @RequestBody BusinessPlanInspectionService.InspectionSearchDto searchDto,
            @PageableDefault Pageable pageable) {
        log.debug("복합 조건 검색 요청 - searchDto: {}", searchDto);
        
        Page<BusinessPlanInspectionService.BusinessPlanInspectionDto> inspections = 
                businessPlanInspectionService.searchInspections(searchDto, pageable);
        return ResponseEntity.ok(inspections);
    }

    /**
     * 점검 통계
     */
    @GetMapping("/statistics")
    public ResponseEntity<BusinessPlanInspectionService.InspectionStatisticsDto> getInspectionStatistics() {
        log.debug("점검 통계 조회 요청");
        
        BusinessPlanInspectionService.InspectionStatisticsDto statistics = 
                businessPlanInspectionService.getInspectionStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 부서별 점검 통계
     */
    @GetMapping("/statistics/department")
    public ResponseEntity<List<BusinessPlanInspectionService.DepartmentInspectionStatisticsDto>> getInspectionStatisticsByDepartment() {
        log.debug("부서별 점검 통계 조회 요청");
        
        List<BusinessPlanInspectionService.DepartmentInspectionStatisticsDto> statistics = 
                businessPlanInspectionService.getInspectionStatisticsByDepartment();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 등급별 점검 통계
     */
    @GetMapping("/statistics/grade")
    public ResponseEntity<List<BusinessPlanInspectionService.GradeStatisticsDto>> getInspectionStatisticsByGrade() {
        log.debug("등급별 점검 통계 조회 요청");
        
        List<BusinessPlanInspectionService.GradeStatisticsDto> statistics = 
                businessPlanInspectionService.getInspectionStatisticsByGrade();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 연도별 점검 통계
     */
    @GetMapping("/statistics/year")
    public ResponseEntity<List<BusinessPlanInspectionService.YearlyStatisticsDto>> getInspectionStatisticsByYear() {
        log.debug("연도별 점검 통계 조회 요청");
        
        List<BusinessPlanInspectionService.YearlyStatisticsDto> statistics = 
                businessPlanInspectionService.getInspectionStatisticsByYear();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 월별 완료 통계
     */
    @GetMapping("/statistics/monthly")
    public ResponseEntity<List<BusinessPlanInspectionService.MonthlyStatisticsDto>> getMonthlyCompletionStatistics() {
        log.debug("월별 완료 통계 조회 요청");
        
        List<BusinessPlanInspectionService.MonthlyStatisticsDto> statistics = 
                businessPlanInspectionService.getMonthlyCompletionStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 연도별 부서 점검 현황
     */
    @GetMapping("/status/year/{year}")
    public ResponseEntity<List<BusinessPlanInspectionService.YearlyInspectionStatusDto>> getYearlyInspectionStatus(
            @PathVariable Integer year) {
        log.debug("연도별 부서 점검 현황 조회 요청 - year: {}", year);
        
        List<BusinessPlanInspectionService.YearlyInspectionStatusDto> status = 
                businessPlanInspectionService.getYearlyInspectionStatus(year);
        return ResponseEntity.ok(status);
    }
}