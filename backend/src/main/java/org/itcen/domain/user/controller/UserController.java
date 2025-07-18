package org.itcen.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.user.dto.UserDto;
import org.itcen.domain.user.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 사용자 컨트롤러
 * 사용자 관련 REST API를 제공
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 HTTP 요청 처리만 담당
 * - Open/Closed: 새로운 엔드포인트 추가 시 확장 가능
 * - Dependency Inversion: UserService 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 사용자 목록 조회
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto.Response>>> getUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String mobile,
            @RequestParam(required = false) String deptCd,
            @RequestParam(required = false) String num,
            @RequestParam(required = false) String jobRankCd,
            @RequestParam(required = false) String jobTitleCd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        UserDto.SearchRequest request = UserDto.SearchRequest.builder()
                .username(username)
                .email(email)
                .address(address)
                .mobile(mobile)
                .deptCd(deptCd)
                .num(num)
                .jobRankCd(jobRankCd)
                .jobTitleCd(jobTitleCd)
                .page(page)
                .size(size)
                .sort(sort)
                .direction(direction)
                .build();

        Page<UserDto.Response> users = userService.getUsers(request);
        return ResponseEntity.ok(ApiResponse.success("사용자 목록을 성공적으로 조회했습니다.", users));
    }

    /**
     * 사용자 상세 조회
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.Response>> getUser(@PathVariable String id) {
        log.info("getUser 호출");
        log.debug("---------------------param :::: " + id);
        UserDto.Response user = userService.getUser(id);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 성공적으로 조회했습니다.", user));
    }

    /**
     * 사용자명으로 사용자 조회
     * GET /api/users/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserDto.Response>> getUserByUsername(@PathVariable String username) {
        UserDto.Response user = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 성공적으로 조회했습니다.", user));
    }

    /**
     * 휴대폰 번호로 사용자 조회
     * GET /api/users/mobile/{mobile}
     */
    @GetMapping("/mobile/{mobile}")
    public ResponseEntity<ApiResponse<UserDto.Response>> getUserByMobile(@PathVariable String mobile) {
        UserDto.Response user = userService.getUserByMobile(mobile);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 성공적으로 조회했습니다.", user));
    }

    /**
     * 사번으로 사용자 조회
     * GET /api/users/num/{num}
     */
    @GetMapping("/num/{num}")
    public ResponseEntity<ApiResponse<UserDto.Response>> getUserByNum(@PathVariable String num) {
        UserDto.Response user = userService.getUserByNum(num);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보를 성공적으로 조회했습니다.", user));
    }

    /**
     * 사용자 생성
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserDto.Response>> createUser(@Valid @RequestBody UserDto.CreateRequest request) {
        UserDto.Response user = userService.createUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("사용자가 성공적으로 생성되었습니다.", user));
    }

    /**
     * 사용자 수정
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto.Response>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserDto.UpdateRequest request) {
        UserDto.Response user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("사용자 정보가 성공적으로 수정되었습니다.", user));
    }

    /**
     * 사용자 삭제
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("사용자가 성공적으로 삭제되었습니다."));
    }

    /**
     * 사원 목록 조회(팝업용)
     * GET /api/users/employees
     * 
     * 사원 검색 팝업에서 사용하는 API
     * 페이징 없이 검색 조건에 맞는 사원 목록을 반환
     */
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<UserDto.Response>>> getEmployees(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String num,
            @RequestParam(required = false) String deptCd,
            @RequestParam(required = false) String jobRankCd,
            @RequestParam(defaultValue = "100") int limit) {

        UserDto.EmployeeSearchRequest request = UserDto.EmployeeSearchRequest.builder()
                .username(username)
                .num(num)
                .deptCd(deptCd)
                .jobRankCd(jobRankCd)
                .limit(limit)
                .build();

        List<UserDto.Response> employees = userService.getEmployees(request);
        return ResponseEntity.ok(ApiResponse.success("사원 목록을 성공적으로 조회했습니다.", employees));
    }

    /**
     * 사용자 통계 조회
     * GET /api/users/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalUserCount", userService.getTotalUserCount());

        return ResponseEntity.ok(ApiResponse.success("사용자 통계를 성공적으로 조회했습니다.", statistics));
    }
} 