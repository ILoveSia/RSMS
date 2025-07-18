package org.itcen.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.auth.domain.AuthRequestDto;
import org.itcen.auth.domain.AuthResponseDto;
import org.itcen.auth.repository.AuthUserRepository;
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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private final PasswordEncoder passwordEncoder;
    private final MenuService menuService;
    
    public AuthService(AuthUserRepository authUserRepository, 
                      PasswordEncoder passwordEncoder,
                      MenuService menuService) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.menuService = menuService;
    }
    
    /**
     * 사용자명 또는 이메일로 사용자 정보 조회 (내부 사용용)
     * Spring Security의 자동 호출을 방지하기 위해 private으로 변경
     * 
     * @param usernameOrEmail 사용자명 또는 이메일
     * @return UserDetails 구현체
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     */
    private UserDetails loadUserByUsernameInternal(String usernameOrEmail) throws UsernameNotFoundException {
        log.debug("내부 사용자 인증 정보 조회: usernameOrEmail '{}'", usernameOrEmail);
        log.debug("usernameOrEmail 길이: {}", usernameOrEmail != null ? usernameOrEmail.length() : "null");
        
        if (usernameOrEmail == null || usernameOrEmail.trim().isEmpty()) {
            log.error("usernameOrEmail이 비어있습니다!");
            throw new UsernameNotFoundException("사용자명 또는 이메일이 비어있습니다.");
        }
        
        User user = authUserRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + usernameOrEmail));
        
        log.debug("사용자 조회 성공: {}", user.getUsername());
        return createUserDetails(user);
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
            log.info("로그인 시도: {}", request.getUserid());
            
            // 1. 사용자 조회
            User user = authUserRepository.findByUsernameOrEmail(request.getUserid())
                    .orElseThrow(() -> new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다."));

            // 2. 비밀번호 검증
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("비밀번호 불일치: {}", request.getUserid());
                throw new BadCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
            }
            
            // 3. UserDetails 생성 (권한 정보 포함)
            UserDetails userDetails = createUserDetails(user);
            
            // 중복 로그인 처리는 기본 HTTP 세션으로 처리
            
            // Spring Security 컨텍스트에 인증 정보 설정
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
            );
            org.springframework.security.core.context.SecurityContextHolder.getContext()
                .setAuthentication(authentication);
            
            // 새 세션 생성
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("authorities", userDetails.getAuthorities());
            
            // Remember Me 처리
            if (Boolean.TRUE.equals(request.getRememberMe())) {
                session.setMaxInactiveInterval(30 * 24 * 60 * 60); // 30일
            }
            
            // 기본 HTTP 세션 사용
            
            // 마지막 로그인 시간 업데이트
            authUserRepository.updateLastLoginTime(user.getId(), LocalDateTime.now());
            
            // 사용자 역할에 따른 접근 가능한 메뉴 조회
            List<String> authorities = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();
            
            log.debug("사용자 권한 목록: {}", authorities);
            
            // 첫 번째 권한을 역할로 사용 (ROLE_ 접두사 제거)
            String userRole = authorities.isEmpty() ? "USER" : 
                    authorities.get(0).replace("ROLE_", "");
            
            log.info("사용자 역할로 메뉴 조회: {} (원본 권한: {})", userRole, authorities);
            List<MenuDto> accessibleMenus = menuService.getAccessibleMenusByRole(userRole);
            log.info("조회된 메뉴 개수: {}", accessibleMenus.size());
            
            // 메뉴가 없는 경우 디버깅 정보 출력
            if (accessibleMenus.isEmpty()) {
                log.warn("메뉴가 조회되지 않았습니다. 역할: {}, 사용자: {}", userRole, user.getUsername());
                // 전체 메뉴 개수 확인
                List<MenuDto> allMenus = menuService.getAllActiveMenus();
                log.warn("전체 활성 메뉴 개수: {}", allMenus.size());
            }
            
            log.info("로그인 성공: {} (Session ID: {})", user.getUsername(), session.getId());
            
            return AuthResponseDto.LoginResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
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
        String username = (String) session.getAttribute("username");
        
        // 기본 HTTP 세션 사용
        
        // HTTP 세션 무효화
        session.invalidate();
        
        log.info("로그아웃 완료: {} (User ID: {})", username, userId);
        
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
        log.info("회원가입 시도: {} ({})", request.getUsername(), request.getEmail());
        
        // 비밀번호 일치 확인
        if (!request.isPasswordMatching()) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        // 중복 확인
        validateDuplicateUser(request);
        
        // 사용자 생성
        User user = User.builder()
                .id(request.getId())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .mobile(request.getMobile())
                .build();
        
        User savedUser = authUserRepository.save(user);
        
        log.info("회원가입 완료: {} (User ID: {})", savedUser.getUsername(), savedUser.getId());
        
        return AuthResponseDto.SignupResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
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
        log.info("비밀번호 변경 시도: User ID {}", userId);
        
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
        
        log.info("비밀번호 변경 완료: User ID {}", userId);
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
        
        User user = authUserRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        
        @SuppressWarnings("unchecked")
        Collection<GrantedAuthority> authorities = (Collection<GrantedAuthority>) session.getAttribute("authorities");
        
        return AuthResponseDto.UserInfoResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .address(user.getAddress())
                .mobile(user.getMobile())
                .authorities(authorities != null ? 
                        authorities.stream().map(GrantedAuthority::getAuthority).toList() : 
                        List.of())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    /**
     * UserDetails 생성
     * 
     * @param user 사용자 엔티티
     * @return UserDetails 구현체
     */
    private UserDetails createUserDetails(User user) {
        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
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
        
        if (authUserRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 사용자명입니다.");
        }
        
        if (authUserRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        
        if (authUserRepository.existsByMobile(request.getMobile())) {
            throw new IllegalArgumentException("이미 사용 중인 휴대폰 번호입니다.");
        }
    }
} 