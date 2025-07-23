package org.itcen.domain.departments.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.departments.dto.DepartmentDto;
import org.itcen.domain.departments.entity.Department;
import org.itcen.domain.departments.repository.DepartmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 부서 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    public List<DepartmentDto> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream()
                .map(DepartmentDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<DepartmentDto> getActiveDepartments() {
        List<Department> departments = departmentRepository.findActiveDepartments();
        return departments.stream()
                .map(DepartmentDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public Page<DepartmentDto> searchDepartments(DepartmentDto.SearchRequestDto searchRequestDto) {
        PageRequest pageRequest = PageRequest.of(searchRequestDto.getPage(), searchRequestDto.getSize());

        Page<Department> departments = departmentRepository.searchDepartments(
                searchRequestDto.getKeyword(),
                searchRequestDto.getUseYn(),
                pageRequest
        );

        return departments.map(DepartmentDto::from);
    }

    @Override
    public List<DepartmentDto> searchDepartmentsList(String keyword, String useYn) {
        List<Department> departments = departmentRepository.searchDepartmentsList(keyword, useYn);
        return departments.stream()
                .map(DepartmentDto::from)
                .collect(Collectors.toList());
    }

    @Override
    public DepartmentDto getDepartmentById(String departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new BusinessException("부서를 찾을 수 없습니다. ID: " + departmentId));

        return DepartmentDto.from(department);
    }

    @Override
    @Transactional
    public DepartmentDto createDepartment(DepartmentDto.CreateRequestDto createRequestDto) {
        // 부서 ID 중복 검사
        if (departmentRepository.existsByDepartmentId(createRequestDto.getDepartmentId())) {
            throw new BusinessException("이미 존재하는 부서 ID입니다: " + createRequestDto.getDepartmentId());
        }

        // 부서명 중복 검사
        if (departmentRepository.findByDepartmentName(createRequestDto.getDepartmentName()).isPresent()) {
            throw new BusinessException("이미 존재하는 부서명입니다: " + createRequestDto.getDepartmentName());
        }

        Department department = createRequestDto.toEntity();
        department.setCreatedId("system"); // TODO: 실제 사용자 ID로 변경
        department.setUpdatedId("system");

        Department savedDepartment = departmentRepository.save(department);

        return DepartmentDto.from(savedDepartment);
    }

    @Override
    @Transactional
    public DepartmentDto updateDepartment(String departmentId, DepartmentDto.UpdateRequestDto updateRequestDto) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new BusinessException("부서를 찾을 수 없습니다. ID: " + departmentId));

        // 부서명 중복 검사 (본인 제외)
        if (updateRequestDto.getDepartmentName() != null &&
            !updateRequestDto.getDepartmentName().equals(department.getDepartmentName()) &&
            departmentRepository.existsByDepartmentNameAndDepartmentIdNot(
                updateRequestDto.getDepartmentName(), departmentId)) {
            throw new BusinessException("이미 존재하는 부서명입니다: " + updateRequestDto.getDepartmentName());
        }

        // 부서 정보 업데이트
        if (updateRequestDto.getDepartmentName() != null) {
            department.setDepartmentName(updateRequestDto.getDepartmentName());
        }
        if (updateRequestDto.getUseYn() != null) {
            department.setUseYn(updateRequestDto.getUseYn());
        }
        department.setUpdatedId("system"); // TODO: 실제 사용자 ID로 변경

        Department savedDepartment = departmentRepository.save(department);

        return DepartmentDto.from(savedDepartment);
    }

    @Override
    @Transactional
    public void deleteDepartment(String departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new BusinessException("부서를 찾을 수 없습니다. ID: " + departmentId));

        department.deactivate();
        department.setUpdatedId("system"); // TODO: 실제 사용자 ID로 변경
        departmentRepository.save(department);
    }

    @Override
    @Transactional
    public void activateDepartment(String departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new BusinessException("부서를 찾을 수 없습니다. ID: " + departmentId));

        department.activate();
        department.setUpdatedId("system"); // TODO: 실제 사용자 ID로 변경
        departmentRepository.save(department);
    }

    @Override
    public String getDepartmentNameById(String departmentId) {
        return departmentRepository.findById(departmentId)
                .map(Department::getDepartmentName)
                .orElse(departmentId); // 부서를 찾을 수 없으면 ID를 반환
    }

}
