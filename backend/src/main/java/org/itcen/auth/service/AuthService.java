package org.itcen.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.auth.domain.AuthRequestDto;
import org.itcen.auth.domain.AuthResponseDto;
import org.itcen.auth.dto.UserWithEmployeeDto;
import org.itcen.auth.repository.AuthUserRepository;
import org.itcen.auth.repository.UserRoleRepository;
import org.itcen.auth.domain.permission.UserRole;
import org.itcen.domain.menu.dto.MenuDto;
import org.itcen.domain.menu.service.MenuService;
import org.itcen.domain.user.entity.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * 인증 서비스
 * 
 * 단일 책임 원칙: 인증 관련 비즈니스 로직만 담당
 * 의존성 역전 원칙: 인터페이스에 의존하여 구현체 변경 가능
 * 직접 인증 방식: Spring Security의 자동 호출 없이 직접 제어
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class AuthService {
    
    private final AuthUserRepository authUserRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MenuService menuService;
    
    public AuthService(AuthUserRepository authUserRepository,
                      UserRoleRepository userRoleRepository,
                      PasswordEncoder passwordEncoder,
                      MenuService menuService) {
        this.authUserRepository = authUserRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.menuService = menuService;
    }
    
    
    /**
     * 로그인 처리
     * 
     * @param request 로그인 요청 DTO
     * @param httpRequest HTTP 요청
     * @return 로그인 응답 DTO
     * @throws AuthenticationException 인증 실패 시
     */
    @Transactional
    public AuthResponseDto.LoginResponse login(AuthRequestDto.LoginRequest request, HttpServletRequest httpRequest) {
        try {
            // 1. 사용자와 employee 정보 함께 조회 (사용자 ID)
            UserWithEmployeeDto userWithEmployee = authUserRepository.findUserWithEmployeeByUserId(request.getUserid())
                    .orElseThrow(() -> new BadCredentialsException("사용자 ID 또는 비밀번호가 올바르지 않습니다."));

            // 2. 비밀번호 검증
            if (!passwordEncoder.matches(request.getPassword(), userWithEmployee.getPassword())) {
                log.warn("비밀번호 불일치: {}", request.getUserid());
                throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
            }
            
            // 3. UserDetails 생성 (권한 정보 포함)
            UserDetails userDetails = createUserDetailsFromDto(userWithEmployee);
            
            // 중복 로그인 처리는 기본 HTTP 세션으로 처리
            
            // Spring Security 컨텍스트에 인증 정보 설정
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
            );
            org.springframework.security.core.context.SecurityContextHolder.getContext()
                .setAuthentication(authentication);
            
            // 새 세션 생성
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("userId", userWithEmployee.getId());
            session.setAttribute("username", userWithEmployee.getEmpNo()); // empNo를 username으로 사용
            session.setAttribute("authorities", userDetails.getAuthorities());
            
            // Remember Me 처리
            if (Boolean.TRUE.equals(request.getRememberMe())) {
                session.setMaxInactiveInterval(30 * 24 * 60 * 60); // 30일
            }
            
            // 기본 HTTP 세션 사용
            
            // 마지막 로그인 시간 업데이트
            authUserRepository.updateLastLoginTime(userWithEmployee.getId(), LocalDateTime.now());
            
            // 사용자 역할에 따른 접근 가능한 메뉴 조회
            List<String> authorities = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
            
            // 가장 높은 권한을 역할로 사용 (우선순위: ADMIN > MANAGER > READONLY > USER)
            String userRole = "USER"; // 기본값
            if (authorities.contains("ROLE_ADMIN")) {
                userRole = "ADMIN";
            } else if (authorities.contains("ROLE_MANAGER")) {
                userRole = "MANAGER";
            } else if (authorities.contains("ROLE_READONLY")) {
                userRole = "READONLY";
            } else if (authorities.contains("ROLE_USER")) {
                userRole = "USER";
            }
            
            log.info("사용자 {} 최종 선택된 역할: {} (전체 권한: {})", userWithEmployee.getId(), userRole, authorities);
            
            List<MenuDto> accessibleMenus = menuService.getAccessibleMenusByRole(userRole);
            
            // 메뉴가 없는 경우 디버깅 정보 출력
            if (accessibleMenus.isEmpty()) {
                log.warn("메뉴가 조회되지 않았습니다. 역할: {}, 사용자: {}", userRole, userWithEmployee.getEmpNo());
                // 전체 메뉴 개수 확인
                List<MenuDto> allMenus = menuService.getAllActiveMenus();
                log.warn("전체 활성 메뉴 개수: {}", allMenus.size());
            }
            
            return AuthResponseDto.LoginResponse.builder()
                    .userId(userWithEmployee.getId())
                    .username(userWithEmployee.getEmpName()) // employee.emp_name을 username으로 사용
                    .empNo(userWithEmployee.getEmpNo()) // users.emp_no 사용
                    .deptCd(userWithEmployee.getDeptCode()) // employee.dept_code 사용
                    .positionCode(userWithEmployee.getPositionCode()) // employee.position_code 사용
                    .authorities(authorities)
                    .sessionId(session.getId())
                    .loginTime(LocalDateTime.now())
                    .sessionExpireTime(LocalDateTime.now().plusSeconds(session.getMaxInactiveInterval()))
                    .rememberMe(request.getRememberMe())
                    .accessibleMenus(accessibleMenus)
                    .build();
                    
        } catch (AuthenticationException e) {
            log.warn("로그인 실패: {} - {}", request.getUserid(), e.getMessage());
            throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    }
    
    /**
     * 로그아웃 처리
     * 
     * @param httpRequest HTTP 요청
     * @return 로그아웃 응답 DTO
     */
    @Transactional
    public AuthResponseDto.LogoutResponse logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            return AuthResponseDto.LogoutResponse.builder()
                    .logoutTime(LocalDateTime.now())
                    .message("이미 로그아웃된 상태입니다.")
                    .build();
        }
        
        String userId = (String) session.getAttribute("userId");
        
        // 기본 HTTP 세션 사용
        
        // HTTP 세션 무효화
        session.invalidate();
        
        return AuthResponseDto.LogoutResponse.builder()
                .userId(userId)
                .logoutTime(LocalDateTime.now())
                .message("로그아웃이 완료되었습니다.")
                .build();
    }
    
    /**
     * 회원가입 처리
     * 
     * @param request 회원가입 요청 DTO
     * @return 회원가입 응답 DTO
     */
    @Transactional
    public AuthResponseDto.SignupResponse signup(AuthRequestDto.SignupRequest request) {
        // 비밀번호 일치 확인
        if (!request.isPasswordMatching()) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        // 중복 확인
        validateDuplicateUser(request);
        
        // 사용자 생성
        User user = User.builder()
                .id(request.getId())
                .password(passwordEncoder.encode(request.getPassword()))
                .empNo(request.getEmpNo()) // empNo 필드 사용
                .build();
        
        User savedUser = authUserRepository.save(user);
        
        return AuthResponseDto.SignupResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getEmpNo()) // empNo를 username으로 사용
                .signupTime(savedUser.getCreatedAt())
                .authorities(List.of("ROLE_USER")) // 기본 권한
                .build();
    }
    
    /**
     * 비밀번호 변경
     * 
     * @param userId 사용자 ID
     * @param request 비밀번호 변경 요청 DTO
     */
    @Transactional
    public void changePassword(String userId, AuthRequestDto.ChangePasswordRequest request) {
        User user = authUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("현재 비밀번호가 올바르지 않습니다.");
        }
        
        // 새 비밀번호 일치 확인
        if (!request.isNewPasswordMatching()) {
            throw new IllegalArgumentException("새 비밀번호가 일치하지 않습니다.");
        }
        
        // 비밀번호 업데이트
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        authUserRepository.updatePassword(userId, encodedNewPassword);
        
        // 비밀번호 변경 시 보안상 재로그인 필요 (기본 HTTP 세션 사용)
    }
    
    /**
     * 현재 로그인한 사용자 정보 조회
     * 
     * @param httpRequest HTTP 요청
     * @return 사용자 정보 응답 DTO
     */
    public AuthResponseDto.UserInfoResponse getCurrentUserInfo(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            return null;
        }
        
        String userId = (String) session.getAttribute("userId");
        if (userId == null) {
            return null;
        }
        
        UserWithEmployeeDto userWithEmployee = authUserRepository.findUserWithEmployeeByUserId(userId).orElse(null);
        if (userWithEmployee == null) {
            return null;
        }
        
        @SuppressWarnings("unchecked")
        Collection<GrantedAuthority> authorities = (Collection<GrantedAuthority>) session.getAttribute("authorities");
        
        return AuthResponseDto.UserInfoResponse.builder()
                .userId(userWithEmployee.getId())
                .username(userWithEmployee.getEmpName()) // employee.emp_name을 username으로 사용
                .empNo(userWithEmployee.getEmpNo()) // users.emp_no 사용
                .deptCd(userWithEmployee.getDeptCode()) // employee.dept_code 사용
                .positionCode(userWithEmployee.getPositionCode()) // employee.position_code 사용
                .authorities(authorities != null ? 
                        authorities.stream().map(GrantedAuthority::getAuthority).toList() : 
                        List.of())
                .createdAt(userWithEmployee.getCreatedAt())
                .updatedAt(userWithEmployee.getUpdatedAt())
                .build();
    }
    
    /**
     * UserDetails 생성 - user_roles 테이블에서 실제 역할 조회 (UserWithEmployeeDto 버전)
     * 
     * @param userWithEmployee 사용자+직원 정보 DTO
     * @return UserDetails 구현체
     */
    private UserDetails createUserDetailsFromDto(UserWithEmployeeDto userWithEmployee) {
        // user_roles 테이블에서 활성화된 역할 조회
        List<String> roleIds = userRoleRepository.findActiveRolesByUserId(userWithEmployee.getId())
                .stream()
                .map(UserRole::getRoleId)
                .toList();
        
        // 역할이 없으면 기본적으로 USER 역할 부여
        if (roleIds.isEmpty()) {
            log.warn("사용자 {}에게 할당된 역할이 없습니다. 기본 USER 역할을 부여합니다.", userWithEmployee.getId());
            roleIds = List.of("USER");
        }
        
        // GrantedAuthority 생성 (ROLE_ 접두사 추가)
        Collection<GrantedAuthority> authorities = roleIds.stream()
                .map(roleId -> new SimpleGrantedAuthority("ROLE_" + roleId))
                .collect(java.util.stream.Collectors.toList());
        
        log.info("사용자 {} 역할 조회 완료: {}", userWithEmployee.getId(), roleIds);
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(userWithEmployee.getEmpNo()) // empNo를 username으로 사용
                .password(userWithEmployee.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    /**
     * UserDetails 생성 - user_roles 테이블에서 실제 역할 조회
     * 
     * @param user 사용자 엔티티
     * @return UserDetails 구현체
     */
    private UserDetails createUserDetails(User user) {
        // user_roles 테이블에서 활성화된 역할 조회
        List<String> roleIds = userRoleRepository.findActiveRolesByUserId(user.getId())
                .stream()
                .map(UserRole::getRoleId)
                .toList();
        
        // 역할이 없으면 기본적으로 USER 역할 부여
        if (roleIds.isEmpty()) {
            log.warn("사용자 {}에게 할당된 역할이 없습니다. 기본 USER 역할을 부여합니다.", user.getId());
            roleIds = List.of("USER");
        }
        
        // GrantedAuthority 생성 (ROLE_ 접두사 추가)
        Collection<GrantedAuthority> authorities = roleIds.stream()
                .map(roleId -> new SimpleGrantedAuthority("ROLE_" + roleId))
                .collect(java.util.stream.Collectors.toList());
        
        log.info("사용자 {} 역할 조회 완료: {}", user.getId(), roleIds);
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmpNo()) // empNo를 username으로 사용
                .password(user.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
    
    /**
     * 중복 사용자 검증
     * 
     * @param request 회원가입 요청 DTO
     */
    private void validateDuplicateUser(AuthRequestDto.SignupRequest request) {
        if (authUserRepository.existsById(request.getId())) {
            throw new IllegalArgumentException("이미 사용 중인 사용자 ID입니다.");
        }
        
        if (authUserRepository.existsByEmpNo(request.getEmpNo())) {
            throw new IllegalArgumentException("이미 사용 중인 사번입니다.");
        }
    }
} 