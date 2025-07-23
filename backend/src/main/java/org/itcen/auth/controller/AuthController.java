package org.itcen.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.itcen.auth.domain.AuthRequestDto;
import org.itcen.auth.domain.AuthResponseDto;
import org.itcen.auth.service.AuthService;
import org.itcen.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 관련 REST API 컨트롤러
 * 
 * 단일 책임 원칙: 인증 관련 HTTP 요청 처리만 담당
 * 개방-폐쇄 원칙: 새로운 인증 API 추가 시 확장 가능
 */
@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    /**
     * 로그인 API
     * 
     * @param request 로그인 요청 DTO
     * @param httpRequest HTTP 요청
     * @return 로그인 응답
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto.LoginResponse>> login(
            @Valid @RequestBody AuthRequestDto.LoginRequest request,
            HttpServletRequest httpRequest) {        
        
        try {
            AuthResponseDto.LoginResponse response = authService.login(request, httpRequest);
            
            return ResponseEntity.ok(
                    ApiResponse.success("로그인이 완료되었습니다.", response)
            );
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "LOGIN_FAILED")
            );
        }
    }
    
    /**
     * 로그아웃 API
     * 
     * @param httpRequest HTTP 요청
     * @return 로그아웃 응답
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<AuthResponseDto.LogoutResponse>> logout(
            HttpServletRequest httpRequest) {
        
        
        try {
            AuthResponseDto.LogoutResponse response = authService.logout(httpRequest);
            
            return ResponseEntity.ok(ApiResponse.success("로그아웃 성공", response));
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "LOGOUT_FAILED")
            );
        }
    }
    
    /**
     * 회원가입 API
     * 
     * @param request 회원가입 요청 DTO
     * @return 회원가입 응답
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponseDto.SignupResponse>> signup(
            @Valid @RequestBody AuthRequestDto.SignupRequest request) {
        
        
        try {
            AuthResponseDto.SignupResponse response = authService.signup(request);
            
            return ResponseEntity.ok(
                    ApiResponse.success("회원가입이 완료되었습니다.", response)
            );
        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "SIGNUP_FAILED")
            );
        }
    }
    
    /**
     * 현재 사용자 정보 조회 API
     * 
     * @param httpRequest HTTP 요청
     * @return 사용자 정보 응답
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AuthResponseDto.UserInfoResponse>> getCurrentUser(
            HttpServletRequest httpRequest) {
        
        
        try {
            AuthResponseDto.UserInfoResponse response = authService.getCurrentUserInfo(httpRequest);
            
            if (response == null) {
                return ResponseEntity.ok(
                        ApiResponse.error("로그인이 필요합니다.", "AUTHENTICATION_REQUIRED")
                );
            }
            
            return ResponseEntity.ok(
                    ApiResponse.success("사용자 정보 조회가 완료되었습니다.", response)
            );
        } catch (Exception e) {
            log.error("사용자 정보 조회 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "USER_INFO_FAILED")
            );
        }
    }
    
    /**
     * 비밀번호 변경 API
     * 
     * @param request 비밀번호 변경 요청 DTO
     * @param httpRequest HTTP 요청
     * @return 비밀번호 변경 응답
     */
    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody AuthRequestDto.ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        
        
        try {
            // 세션에서 사용자 ID 추출
            String userId = (String) httpRequest.getSession().getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("로그인이 필요합니다.", "AUTHENTICATION_REQUIRED")
                );
            }
            
            authService.changePassword(userId, request);
            
            return ResponseEntity.ok(
                    ApiResponse.success("비밀번호가 변경되었습니다. 다시 로그인해 주세요.")
            );
        } catch (Exception e) {
            log.error("비밀번호 변경 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "PASSWORD_CHANGE_FAILED")
            );
        }
    }
    
    /**
     * 세션 정보 조회 API (기본 HTTP 세션 사용)
     * 
     * @param httpRequest HTTP 요청
     * @return 세션 정보 응답
     */
    @GetMapping("/session")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> getSessionInfo(
            HttpServletRequest httpRequest) {
        
        
        try {
            HttpSession session = httpRequest.getSession(false);
            if (session == null) {
                return ResponseEntity.ok(
                        ApiResponse.error("유효한 세션이 없습니다.", "NO_VALID_SESSION")
                );
            }
            
            String sessionId = session.getId();
            return ResponseEntity.ok(
                    ApiResponse.success("세션 정보 조회가 완료되었습니다.", "Session ID: " + sessionId)
            );
        } catch (Exception e) {
            log.error("세션 정보 조회 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "SESSION_INFO_FAILED")
            );
        }
    }
    
    /**
     * 세션 연장 API (기본 HTTP 세션에서는 지원하지 않음)
     * 
     * @param additionalMinutes 추가 시간 (분)
     * @param httpRequest HTTP 요청
     * @return 세션 연장 응답
     */
    @PutMapping("/session/extend")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> extendSession(
            @RequestParam(defaultValue = "30") int additionalMinutes,
            HttpServletRequest httpRequest) {
        
        
        return ResponseEntity.ok(
                ApiResponse.error("기본 HTTP 세션에서는 세션 연장을 지원하지 않습니다.", "SESSION_EXTEND_NOT_SUPPORTED")
        );
    }
    
    /**
     * 로그인 상태 확인 API
     * 
     * @param httpRequest HTTP 요청
     * @return 로그인 상태 응답
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Boolean>> checkAuthStatus(HttpServletRequest httpRequest) {
        
        
        try {
            boolean isAuthenticated = httpRequest.getSession(false) != null &&
                    httpRequest.getSession().getAttribute("userId") != null;
            
            return ResponseEntity.ok(
                    ApiResponse.success(isAuthenticated ? "로그인 상태입니다." : "로그인이 필요합니다.", 
                            isAuthenticated)
            );
        } catch (Exception e) {
            log.error("로그인 상태 확인 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage(), "AUTH_STATUS_CHECK_FAILED")
            );
        }
    }
    
    /**
     * 활성 세션 수 조회 API (관리자용) - 기본 HTTP 세션에서는 지원하지 않음
     * 
     * @return 활성 세션 수 응답
     */
    @GetMapping("/sessions/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getActiveSessionCount() {
        
        
        return ResponseEntity.ok(
                ApiResponse.error("기본 HTTP 세션에서는 활성 세션 수 조회를 지원하지 않습니다.", "SESSION_COUNT_NOT_SUPPORTED")
        );
    }


} 