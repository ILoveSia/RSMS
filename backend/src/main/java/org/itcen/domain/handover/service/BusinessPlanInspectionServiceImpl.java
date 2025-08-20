package org.itcen.domain.handover.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.handover.entity.BusinessPlanInspection;
import org.itcen.domain.handover.repository.BusinessPlanInspectionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 사업계획 점검 서비스 구현체
 * 사업계획 점검 관련 비즈니스 로직을 구현합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 비즈니스 로직만 담당
 * - Open/Closed: 새로운 점검 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: BusinessPlanInspectionService 인터페이스 준수
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessPlanInspectionServiceImpl implements BusinessPlanInspectionService {

    private final BusinessPlanInspectionRepository businessPlanInspectionRepository;

    @Override
    @Transactional
    public BusinessPlanInspection createInspection(BusinessPlanInspection inspection) {
        log.debug("사업계획 점검 생성 시작 - deptCd: {}, year: {}, quarter: {}", 
                  inspection.getDeptCd(), inspection.getInspectionYear(), inspection.getInspectionQuarter());

        // 중복 체크: 같은 부서, 연도, 분기에 대한 점검이 있는지 확인
        List<BusinessPlanInspection> existingInspections = businessPlanInspectionRepository
                .findByDeptCdAndInspectionYearAndInspectionQuarter(
                        inspection.getDeptCd(), 
                        inspection.getInspectionYear(), 
                        inspection.getInspectionQuarter());
        
        if (!existingInspections.isEmpty()) {
            throw new BusinessException("해당 부서의 동일한 연도/분기에 이미 점검이 있습니다.");
        }

        BusinessPlanInspection savedInspection = businessPlanInspectionRepository.save(inspection);



        log.debug("사업계획 점검 생성 완료 - inspectionId: {}", savedInspection.getInspectionId());
        return savedInspection;
    }

    @Override
    @Transactional
    public BusinessPlanInspection updateInspection(Long inspectionId, BusinessPlanInspection inspection) {
        log.debug("사업계획 점검 수정 시작 - inspectionId: {}", inspectionId);

        BusinessPlanInspection existingInspection = businessPlanInspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new BusinessException("사업계획 점검을 찾을 수 없습니다: " + inspectionId));

        // 수정 가능 여부 확인 (완료된 점검은 수정 불가)
        if (existingInspection.getStatus() == BusinessPlanInspection.InspectionStatus.COMPLETED) {
            throw new BusinessException("완료된 사업계획 점검은 수정할 수 없습니다.");
        }

        // 필드 업데이트
        existingInspection.setDeptCd(inspection.getDeptCd());
        existingInspection.setInspectionYear(inspection.getInspectionYear());
        existingInspection.setInspectionQuarter(inspection.getInspectionQuarter());
        existingInspection.setInspectionTitle(inspection.getInspectionTitle());
        existingInspection.setInspectionType(inspection.getInspectionType());
        existingInspection.setPlannedStartDate(inspection.getPlannedStartDate());
        existingInspection.setPlannedEndDate(inspection.getPlannedEndDate());
        existingInspection.setInspectionScope(inspection.getInspectionScope());
        existingInspection.setInspectionCriteria(inspection.getInspectionCriteria());
        existingInspection.setStatus(inspection.getStatus());
        existingInspection.setInspectorEmpNo(inspection.getInspectorEmpNo());
        existingInspection.setUpdatedId(inspection.getUpdatedId());

        BusinessPlanInspection savedInspection = businessPlanInspectionRepository.save(existingInspection);



        log.debug("사업계획 점검 수정 완료 - inspectionId: {}", inspectionId);
        return savedInspection;
    }

    @Override
    public Optional<BusinessPlanInspection> getInspection(Long inspectionId) {
        log.debug("사업계획 점검 조회 - inspectionId: {}", inspectionId);
        return businessPlanInspectionRepository.findById(inspectionId);
    }

    @Override
    @Transactional
    public void deleteInspection(Long inspectionId) {
        log.debug("사업계획 점검 삭제 시작 - inspectionId: {}", inspectionId);

        BusinessPlanInspection inspection = businessPlanInspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new BusinessException("사업계획 점검을 찾을 수 없습니다: " + inspectionId));

        // 삭제 가능 여부 확인 (진행중이거나 완료된 점검은 삭제 불가)
        if (inspection.getStatus() == BusinessPlanInspection.InspectionStatus.IN_PROGRESS ||
            inspection.getStatus() == BusinessPlanInspection.InspectionStatus.COMPLETED) {
            throw new BusinessException("진행중이거나 완료된 사업계획 점검은 삭제할 수 없습니다.");
        }

        businessPlanInspectionRepository.delete(inspection);
        log.debug("사업계획 점검 삭제 완료 - inspectionId: {}", inspectionId);
    }

    @Override
    public Page<BusinessPlanInspection> getAllInspections(Pageable pageable) {
        log.debug("모든 사업계획 점검 조회 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return businessPlanInspectionRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public void startInspection(Long inspectionId, String inspectorEmpNo, String actorEmpNo) {
        log.debug("점검 시작 - inspectionId: {}, inspectorEmpNo: {}", inspectionId, inspectorEmpNo);

        BusinessPlanInspection inspection = businessPlanInspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new BusinessException("사업계획 점검을 찾을 수 없습니다: " + inspectionId));

        // 시작 가능 여부 확인
        if (inspection.getStatus() != BusinessPlanInspection.InspectionStatus.PLANNED) {
            throw new BusinessException("계획 상태의 점검만 시작할 수 있습니다.");
        }

        inspection.startInspection(inspectorEmpNo);
        inspection.setUpdatedId(actorEmpNo);
        businessPlanInspectionRepository.save(inspection);

        log.debug("점검 시작 완료 - inspectionId: {}", inspectionId);
    }

    @Override
    @Transactional
    public void completeInspection(Long inspectionId, BusinessPlanInspection.InspectionGrade grade, String actorEmpNo) {
        log.debug("점검 완료 - inspectionId: {}, grade: {}", inspectionId, grade);

        BusinessPlanInspection inspection = businessPlanInspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new BusinessException("사업계획 점검을 찾을 수 없습니다: " + inspectionId));

        // 완료 가능 여부 확인
        if (inspection.getStatus() != BusinessPlanInspection.InspectionStatus.IN_PROGRESS) {
            throw new BusinessException("진행중인 점검만 완료할 수 있습니다.");
        }

        inspection.completeInspection();
        inspection.setOverallGrade(grade);
        inspection.setUpdatedId(actorEmpNo);
        businessPlanInspectionRepository.save(inspection);

        log.debug("점검 완료 - inspectionId: {}", inspectionId);
    }

    @Override
    @Transactional
    public void cancelInspection(Long inspectionId, String actorEmpNo, String reason) {
        log.debug("점검 취소 - inspectionId: {}, reason: {}", inspectionId, reason);

        BusinessPlanInspection inspection = businessPlanInspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new BusinessException("사업계획 점검을 찾을 수 없습니다: " + inspectionId));

        // 취소 가능 여부 확인
        if (inspection.getStatus() == BusinessPlanInspection.InspectionStatus.COMPLETED) {
            throw new BusinessException("완료된 점검은 취소할 수 없습니다.");
        }

        inspection.cancelInspection();
        inspection.setUpdatedId(actorEmpNo);
        businessPlanInspectionRepository.save(inspection);

        log.debug("점검 취소 완료 - inspectionId: {}", inspectionId);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByDepartment(String deptCd) {
        log.debug("부서별 사업계획 점검 조회 - deptCd: {}", deptCd);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByDeptCd(deptCd);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByYear(Integer inspectionYear) {
        log.debug("연도별 점검 조회 - year: {}", inspectionYear);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByInspectionYear(inspectionYear);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByYearAndQuarter(Integer inspectionYear, Integer inspectionQuarter) {
        log.debug("연도/분기별 점검 조회 - year: {}, quarter: {}", inspectionYear, inspectionQuarter);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findByInspectionYearAndInspectionQuarter(inspectionYear, inspectionQuarter);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByType(BusinessPlanInspection.InspectionType inspectionType) {
        log.debug("유형별 점검 조회 - type: {}", inspectionType);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByInspectionType(inspectionType);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByStatus(BusinessPlanInspection.InspectionStatus status) {
        log.debug("상태별 점검 조회 - status: {}", status);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByStatus(status);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByInspector(String inspectorEmpNo) {
        log.debug("점검자별 점검 조회 - inspectorEmpNo: {}", inspectorEmpNo);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByInspectorEmpNo(inspectorEmpNo);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByGrade(BusinessPlanInspection.InspectionGrade overallGrade) {
        log.debug("등급별 점검 조회 - grade: {}", overallGrade);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByOverallGrade(overallGrade);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByImprovementStatus(BusinessPlanInspection.ImprovementStatus improvementStatus) {
        log.debug("개선 상태별 점검 조회 - improvementStatus: {}", improvementStatus);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findByImprovementStatus(improvementStatus);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByDepartmentAndYear(String deptCd, Integer year) {
        log.debug("부서/연도별 점검 조회 - deptCd: {}, year: {}", deptCd, year);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findByDeptCdAndInspectionYear(deptCd, year);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getLatestInspectionsByDepartment(String deptCd, int limit) {
        log.debug("부서 최신 점검 조회 - deptCd: {}, limit: {}", deptCd, limit);
        Pageable pageable = Pageable.ofSize(limit);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findLatestInspectionsByDepartment(deptCd, pageable);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getInspectionsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("기간별 점검 조회 - startDate: {}, endDate: {}", startDate, endDate);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findInspectionsByDateRange(startDate, endDate);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getDelayedInspections() {
        log.debug("지연된 점검 조회");
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findDelayedInspections(LocalDate.now());
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getImprovementsDueSoon(int daysFromNow) {
        log.debug("개선사항 기한 임박 점검 조회 - daysFromNow: {}", daysFromNow);
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(daysFromNow);
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findImprovementsDueSoon(startDate, endDate);
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getOverdueImprovements() {
        log.debug("개선사항 지연 점검 조회");
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository
                .findOverdueImprovements(LocalDate.now());
        return convertToDto(inspections);
    }

    @Override
    public List<BusinessPlanInspectionDto> getActiveInspections() {
        log.debug("진행중인 점검 조회");
        List<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findActiveInspections();
        return convertToDto(inspections);
    }

    @Override
    public Page<BusinessPlanInspectionService.BusinessPlanInspectionDto> searchInspections(BusinessPlanInspectionService.InspectionSearchDto searchDto, Pageable pageable) {
        log.debug("복합 조건 검색 - searchDto: {}", searchDto);
        
        Page<BusinessPlanInspection> inspections = businessPlanInspectionRepository.findBySearchCriteria(
                searchDto.getDeptCd(),
                searchDto.getInspectionYear(),
                searchDto.getInspectionQuarter(),
                searchDto.getInspectionType(),
                searchDto.getStatus(),
                searchDto.getInspectorEmpNo(),
                pageable
        );
        
        return inspections.map(this::convertToDto);
    }
    private List<BusinessPlanInspectionDto> convertToDto(List<BusinessPlanInspection> inspections) {
        return inspections.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private BusinessPlanInspectionService.BusinessPlanInspectionDto convertToDto(BusinessPlanInspection inspection) {
        return new BusinessPlanInspectionService.BusinessPlanInspectionDto() {
            @Override
            public Long getInspectionId() { return inspection.getInspectionId(); }
            
            @Override
            public String getDeptCd() { return inspection.getDeptCd(); }
            
            @Override
            public String getDeptName() { return null; } // TODO: Department 조인 후 구현
            
            @Override
            public Integer getInspectionYear() { return inspection.getInspectionYear(); }
            
            @Override
            public Integer getInspectionQuarter() { return inspection.getInspectionQuarter(); }
            
            @Override
            public String getInspectionTitle() { return inspection.getInspectionTitle(); }
            
            @Override
            public BusinessPlanInspection.InspectionType getInspectionType() { return inspection.getInspectionType(); }
            
            @Override
            public LocalDate getPlannedStartDate() { return inspection.getPlannedStartDate(); }
            
            @Override
            public LocalDate getPlannedEndDate() { return inspection.getPlannedEndDate(); }
            
            @Override
            public String getInspectionScope() { return inspection.getInspectionScope(); }
            
            @Override
            public String getInspectionCriteria() { return inspection.getInspectionCriteria(); }

            @Override
            public LocalDate getActualStartDate() {
                return inspection.getActualStartDate();
            }

            @Override
            public LocalDate getActualEndDate() {
                return inspection.getActualEndDate();
            }

            @Override
            public BusinessPlanInspection.InspectionStatus getStatus() { return inspection.getStatus(); }
            
            @Override
            public String getInspectorEmpNo() { return inspection.getInspectorEmpNo(); }
            
            @Override
            public boolean isOnSchedule() { return inspection.isOnSchedule(); }
        };
    }
}