package org.itcen.domain.departments.controller;

import java.util.List;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.departments.dto.DepartmentDto;
import org.itcen.domain.departments.service.DepartmentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

/**
 * 부서 관리 Controller
 */
@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * 모든 부서 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    /**
     * 활성 부서 목록 조회
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getActiveDepartments() {
        List<DepartmentDto> departments = departmentService.getActiveDepartments();
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    /**
     * 프론트엔드 호환용 부서 목록 조회
     */
    /**
     * 부서 검색 (페이징)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<DepartmentDto>>> searchDepartments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String useYn,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        DepartmentDto.SearchRequestDto searchRequestDto = DepartmentDto.SearchRequestDto.builder()
                .keyword(keyword).useYn(useYn).page(page).size(size).build();

        Page<DepartmentDto> departments = departmentService.searchDepartments(searchRequestDto);
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    /**
     * 부서 검색 (목록)
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> searchDepartmentsList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String useYn) {

        List<DepartmentDto> departments = departmentService.searchDepartmentsList(keyword, useYn);
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    /**
     * 부서 상세 조회
     */
    @GetMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(
            @PathVariable String departmentId) {
        DepartmentDto department = departmentService.getDepartmentById(departmentId);
        return ResponseEntity.ok(ApiResponse.success(department));
    }

    /**
     * 부서 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(
            @RequestBody DepartmentDto.CreateRequestDto createRequestDto) {

        DepartmentDto department = departmentService.createDepartment(createRequestDto);
        return ResponseEntity.ok(ApiResponse.success("부서가 성공적으로 생성되었습니다.", department));
    }

    /**
     * 부서 수정
     */
    @PutMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<DepartmentDto>> updateDepartment(
            @PathVariable String departmentId,
            @RequestBody DepartmentDto.UpdateRequestDto updateRequestDto) {

        DepartmentDto department =
                departmentService.updateDepartment(departmentId, updateRequestDto);
        return ResponseEntity.ok(ApiResponse.success("부서가 성공적으로 수정되었습니다.", department));
    }

    /**
     * 부서 삭제 (비활성화)
     */
    @DeleteMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable String departmentId) {
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("부서가 성공적으로 비활성화되었습니다."));
    }

    /**
     * 부서 활성화
     */
    @PutMapping("/{departmentId}/activate")
    public ResponseEntity<ApiResponse<Void>> activateDepartment(@PathVariable String departmentId) {
        departmentService.activateDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("부서가 성공적으로 활성화되었습니다."));
    }

    /**
     * 부서명 조회
     */
    @GetMapping("/{departmentId}/name")
    public ResponseEntity<ApiResponse<String>> getDepartmentName(
            @PathVariable String departmentId) {
        String departmentName = departmentService.getDepartmentNameById(departmentId);
        return ResponseEntity.ok(ApiResponse.success(departmentName));
    }
}
