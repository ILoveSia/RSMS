package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.AuditorDto;
import org.itcen.domain.audit.repository.AuditProgMngtDetailRepository;
import org.itcen.domain.employee.entity.Employee;
import org.itcen.domain.employee.repository.EmployeeRepository;
import org.itcen.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 점검자 서비스 구현체
 * 점검자 조회 및 지정 기능 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditorServiceImpl implements AuditorService {

    private final EmployeeRepository employeeRepository;
    private final AuditProgMngtDetailRepository auditProgMngtDetailRepository;

    @Override
    public List<AuditorDto.AuditorInfoResponse> searchAuditors(AuditorDto.AuditorSearchRequest searchRequest) {
        log.debug("점검자 검색 요청: {}", searchRequest);
        
        String empName = searchRequest.getEmpName();
        String deptCode = searchRequest.getDeptCode();
        
        List<Employee> employees;
        
        if (StringUtils.hasText(empName) || StringUtils.hasText(deptCode)) {
            employees = employeeRepository.searchEmployees(empName, deptCode);
        } else {
            employees = employeeRepository.findByUseYnOrderByEmpName("Y");
        }
        
        return employees.stream()
                .map(this::convertToAuditorInfoResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditorDto.AuditorInfoResponse> searchAuditorsByName(String empName) {
        log.debug("성명으로 점검자 검색: {}", empName);
        
        if (!StringUtils.hasText(empName)) {
            throw new BusinessException("검색할 성명을 입력해주세요.");
        }
        
        List<Employee> employees = employeeRepository.findByEmpNameContainingAndUseYn(empName);
        
        return employees.stream()
                .map(this::convertToAuditorInfoResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AuditorDto.AuditorAssignmentResponse assignAuditor(AuditorDto.AuditorAssignmentRequest assignmentRequest) {
        log.debug("점검자 지정 요청: {}", assignmentRequest);
        
        // 유효성 검증
        if (assignmentRequest.getHodIcItemIds() == null || assignmentRequest.getHodIcItemIds().length == 0) {
            throw new BusinessException("점검 항목을 선택해주세요.");
        }
        
        if (!StringUtils.hasText(assignmentRequest.getAuditorEmpNo())) {
            throw new BusinessException("점검자를 선택해주세요.");
        }
        
        // 점검자 존재 여부 확인
        Employee auditor = employeeRepository.findByEmpNo(assignmentRequest.getAuditorEmpNo())
                .orElseThrow(() -> new BusinessException("존재하지 않는 점검자입니다."));
        
        if (!auditor.isUsable()) {
            throw new BusinessException("사용 불가능한 점검자입니다.");
        }
        
        // 점검자 지정 업데이트
        int updatedCount = 0;
        for (String hodIcItemId : assignmentRequest.getHodIcItemIds()) {
            try {
                Long itemId = Long.parseLong(hodIcItemId);
                
                log.debug("점검자 지정 시도 - 항목 ID: {}, 점검자: {}", itemId, assignmentRequest.getAuditorEmpNo());
                
                int result = auditProgMngtDetailRepository.updateAuditorByHodIcItemId(
                    itemId, 
                    assignmentRequest.getAuditorEmpNo()
                );
                
                updatedCount += result;
                
                log.info("점검자 지정 성공 - 항목 ID: {}, 점검자: {}, 업데이트된 행: {}", 
                    itemId, assignmentRequest.getAuditorEmpNo(), result);
                
                if (result == 0) {
                    log.warn("업데이트된 행이 없습니다. 항목 ID {} 확인 필요", itemId);
                }
                
            } catch (NumberFormatException e) {
                log.error("잘못된 항목 ID 형식: {}", hodIcItemId, e);
            }
        }
        
        log.info("점검자 지정 완료 - 총 {}건 업데이트", updatedCount);
        
        return AuditorDto.AuditorAssignmentResponse.builder()
                .updatedCount(updatedCount)
                .auditorEmpNo(assignmentRequest.getAuditorEmpNo())
                .auditorName(auditor.getEmpName())
                .message(String.format("점검자 지정이 완료되었습니다. (총 %d건)", updatedCount))
                .build();
    }

    /**
     * Employee 엔티티를 AuditorInfoResponse DTO로 변환
     */
    private AuditorDto.AuditorInfoResponse convertToAuditorInfoResponse(Employee employee) {
        return AuditorDto.AuditorInfoResponse.builder()
                .empNo(employee.getEmpNo())
                .empName(employee.getEmpName())
                .deptName(employee.getDeptName())
                .positionName(employee.getPositionName())
                .email(employee.getEmail())
                .phoneNo(employee.getPhoneNo())
                .useYn(employee.getUseYn())
                .build();
    }
}