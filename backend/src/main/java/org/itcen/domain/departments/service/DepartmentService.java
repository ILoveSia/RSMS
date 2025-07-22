package org.itcen.domain.departments.service;

import java.util.List;
import org.itcen.domain.departments.dto.DepartmentDto;
import org.springframework.data.domain.Page;

/**
 * 부서 서비스 인터페이스
 */
public interface DepartmentService {

    /**
     * 모든 부서 조회
     */
    List<DepartmentDto> getAllDepartments();

    /**
     * 활성 부서 목록 조회
     */
    List<DepartmentDto> getActiveDepartments();

    /**
     * 부서 검색 (페이징)
     */
    Page<DepartmentDto> searchDepartments(DepartmentDto.SearchRequestDto searchRequestDto);

    /**
     * 부서 검색 (목록)
     */
    List<DepartmentDto> searchDepartmentsList(String keyword, String useYn);

    /**
     * 부서 상세 조회
     */
    DepartmentDto getDepartmentById(String departmentId);

    /**
     * 부서 생성
     */
    DepartmentDto createDepartment(DepartmentDto.CreateRequestDto createRequestDto);

    /**
     * 부서 수정
     */
    DepartmentDto updateDepartment(String departmentId,
            DepartmentDto.UpdateRequestDto updateRequestDto);

    /**
     * 부서 삭제 (비활성화)
     */
    void deleteDepartment(String departmentId);

    /**
     * 부서 활성화
     */
    void activateDepartment(String departmentId);

    /**
     * 부서명으로 부서 조회
     */
    String getDepartmentNameById(String departmentId);

}
