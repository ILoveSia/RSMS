package org.itcen.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.user.dto.UserDto;
import org.itcen.domain.user.entity.User;
import org.itcen.domain.user.repository.UserRepository;
import org.itcen.domain.employee.entity.Employee;
import org.itcen.domain.employee.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직을 처리
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Dependency Inversion: Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    /**
     * 사용자 목록 조회 (Employee JOIN 포함)
     */
    public Page<UserDto.Response> getUsers(UserDto.SearchRequest request) {
        // 정렬 방향 설정
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getDirection()) 
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        // Pageable 생성
        Pageable pageable = PageRequest.of(
                request.getPage(), 
                request.getSize(), 
                Sort.by(direction, request.getSort())
        );

        // Employee JOIN을 통한 검색 조건 조회
        Page<Object[]> results = userRepository.findBySearchCriteria(
                request.getUsername(), // empName으로 검색
                request.getEmpNo(),
                request.getDepartmentName(),
                request.getPositionName(),
                pageable
        );

        return results.map(result -> {
            User user = (User) result[0];
            Employee employee = (Employee) result[1];
            
            return UserDto.Response.from(
                user,
                employee != null ? employee.getDeptName() : null,
                employee != null ? employee.getPositionName() : null
            ).toBuilder()
                .username(employee != null ? employee.getEmpName() : null) // empName을 username으로 설정
                .build();
        });
    }

    /**
     * 사원 목록 조회 (팝업용)
     * 페이징 없이 검색 조건에 맞는 사원 목록을 반환
     * employee 테이블 사용
     */
    public List<UserDto.Response> getEmployees(UserDto.EmployeeSearchRequest request) {
        // 검색 조건에 따른 조회
        List<Employee> employees = employeeRepository.searchEmployees(
                request.getUsername(),
                request.getDepartmentName()
        );

        // limit 적용
        return employees.stream()
                .limit(request.getLimit())
                .map(employee -> UserDto.Response.builder()
                        .id(employee.getEmpNo())
                        .username(employee.getEmpName())
                        .empNo(employee.getEmpNo())
                        .departmentName(employee.getDeptName())
                        .positionName(employee.getPositionName())
                        .createdAt(employee.getCreatedAt())
                        .updatedAt(employee.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 사용자 상세 조회
     */
    public UserDto.Response getUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + id));
        
        return UserDto.Response.from(user);
    }

    /**
     * 사원명으로 사용자 조회
     * employee 테이블 사용
     */
    public UserDto.Response getUserByEmployeeName(String empName) {
        log.info("사원명으로 사용자 조회 시도: {}", empName);
        Employee employee = employeeRepository.findByEmpName(empName)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. EmpName: " + empName));
        
        return UserDto.Response.builder()
                .id(employee.getEmpNo())
                .username(employee.getEmpName())
                .empNo(employee.getEmpNo())
                .departmentName(employee.getDeptName())
                .positionName(employee.getPositionName())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    /**
     * 사용자 생성
     */
    @Transactional
    public UserDto.Response createUser(UserDto.CreateRequest request) {

        // 중복 검사
        if (userRepository.existsById(request.getId())) {
            throw new IllegalArgumentException("이미 존재하는 ID입니다: " + request.getId());
        }

        // Employee 이름 중복 검사는 Employee 테이블에서 처리
        // 필요시 별도 검증 로직 추가

        // 사번 중복 검사 제거 (사번이 있는 경우에도 허용)
//        if (request.getEmpNo() != null && !request.getEmpNo().trim().isEmpty()) {
//            if (userRepository.existsByEmpNo(request.getEmpNo())) {
//                throw new IllegalArgumentException("이미 존재하는 사번입니다: " + request.getEmpNo());
//            }
//        }

        // 엔티티 생성 및 저장 (비밀번호 암호화 적용)
        User user = request.toEntity();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        return UserDto.Response.from(savedUser);
    }

    /**
     * 사용자 수정
     */
    @Transactional
    public UserDto.Response updateUser(String id, UserDto.UpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + id));


        // 직책코드 제거 반영: jobTitleCd 관련 업데이트 제거

        User updatedUser = userRepository.save(user);
        return UserDto.Response.from(updatedUser);
    }

    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + id));

        userRepository.delete(user);
    }

    /**
     * 전체 사용자 수 조회
     */
    public long getTotalUserCount() {
        return userRepository.countAllUsers();
    }

    /**
     * 사번으로 사용자 조회
     * employee 테이블 사용
     */
    public UserDto.Response getUserByEmpNo(String empNo) {
        log.info("사번으로 사용자 조회 시도: {}", empNo);
        Employee employee = employeeRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. EmpNo: " + empNo));
        
        return UserDto.Response.builder()
                .id(employee.getEmpNo())
                .username(employee.getEmpName())
                .empNo(employee.getEmpNo())
                .departmentName(employee.getDeptName())
                .positionName(employee.getPositionName())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}