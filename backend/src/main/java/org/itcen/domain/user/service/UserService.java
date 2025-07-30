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

    /**
     * 사용자 목록 조회
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

        // 검색 조건에 따른 조회
        Page<User> users = userRepository.findBySearchCriteria(
                request.getUsername(),
                request.getEmail(),
                request.getAddress(),
                request.getMobile(),
                request.getDeptCd(),
                request.getNum(),
                request.getJobRankCd(),
                request.getJobTitleCd(),
                pageable
        );

        return users.map(UserDto.Response::from);
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
                request.getDeptCd()
        );

        // limit 적용
        return employees.stream()
                .limit(request.getLimit())
                .map(employee -> {
                    log.info("Employee 매핑 - empNo: {}, empName: {}", employee.getEmpNo(), employee.getEmpName());
                    return UserDto.Response.builder()
                            .id(employee.getEmpNo())
                            .username(employee.getEmpName())
                            .email(employee.getEmail())
                            .address("")
                            .mobile(employee.getPhoneNo())
                            .deptCd(employee.getDeptCode())
                            .num(employee.getEmpNo())
                            .jobRankCd(employee.getPositionCode())
                            .jobTitleCd(employee.getPositionName())
                            .createdAt(employee.getCreatedAt())
                            .updatedAt(employee.getUpdatedAt())
                            .build();
                })
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
     * 사용자명으로 사용자 조회
     */
    public UserDto.Response getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. Username: " + username));
        
        return UserDto.Response.from(user);
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

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
        }

        if (userRepository.existsByMobile(request.getMobile())) {
            throw new IllegalArgumentException("이미 존재하는 휴대폰 번호입니다: " + request.getMobile());
        }

        // 사번 중복 검사 (사번이 있는 경우에만)
        if (request.getNum() != null && !request.getNum().trim().isEmpty()) {
            if (userRepository.existsByNum(request.getNum())) {
                throw new IllegalArgumentException("이미 존재하는 사번입니다: " + request.getNum());
            }
        }

        // 엔티티 생성 및 저장
        User user = request.toEntity();
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

        // 이메일 중복 검사 (자신 제외)
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // 휴대폰 번호 중복 검사 (자신 제외)
        if (request.getMobile() != null && !request.getMobile().equals(user.getMobile())) {
            if (userRepository.existsByMobile(request.getMobile())) {
                throw new IllegalArgumentException("이미 존재하는 휴대폰 번호입니다: " + request.getMobile());
            }
            user.setMobile(request.getMobile());
        }

        // 사번 중복 검사 (자신 제외)
        if (request.getNum() != null && !request.getNum().equals(user.getNum())) {
            if (userRepository.existsByNum(request.getNum())) {
                throw new IllegalArgumentException("이미 존재하는 사번입니다: " + request.getNum());
            }
            user.setNum(request.getNum());
        }

        // 필드 업데이트
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getDeptCd() != null) {
            user.setDeptCd(request.getDeptCd());
        }

        if (request.getJobRankCd() != null) {
            user.setJobRankCd(request.getJobRankCd());
        }

        if (request.getJobTitleCd() != null) {
            user.setJobTitleCd(request.getJobTitleCd());
        }

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
     * 휴대폰 번호로 사용자 조회
     * employee 테이블 사용
     */
    public UserDto.Response getUserByMobile(String mobile) {        
        Employee employee = employeeRepository.findByPhoneNo(mobile)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. Mobile: " + mobile));
        
        return UserDto.Response.builder()
                .id(employee.getEmpNo())
                .username(employee.getEmpName())
                .email(employee.getEmail())
                .address("")
                .mobile(employee.getPhoneNo())
                .deptCd(employee.getDeptCode())
                .num(employee.getEmpNo())
                .jobRankCd(employee.getPositionCode())
                .jobTitleCd(employee.getPositionName())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    /**
     * 사번으로 사용자 조회
     * employee 테이블 사용
     */
    public UserDto.Response getUserByNum(String num) {
        log.info("사번으로 사용자 조회 시도: {}", num);
        Employee employee = employeeRepository.findByEmpNo(num)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. Num: " + num));
        
        return UserDto.Response.builder()
                .id(employee.getEmpNo())
                .username(employee.getEmpName())
                .email(employee.getEmail())
                .address("")
                .mobile(employee.getPhoneNo())
                .deptCd(employee.getDeptCode())
                .num(employee.getEmpNo())
                .jobRankCd(employee.getPositionCode())
                .jobTitleCd(employee.getPositionName())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}