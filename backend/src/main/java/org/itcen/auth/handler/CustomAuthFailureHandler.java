package org.itcen.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 인증 실패 핸들러
 * 
 * 단일 책임 원칙: 인증 실패 처리만 담당
 * 개방-폐쇄 원칙: 새로운 실패 처리 로직 추가 시 확장 가능
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthFailureHandler implements AuthenticationFailureHandler {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                      AuthenticationException exception) throws IOException, ServletException {
        
        log.warn("인증 실패: {}", exception.getMessage());
        
        // 응답 설정
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        // 실패 사유별 메시지 설정
        String errorMessage = getErrorMessage(exception);
        String errorCode = getErrorCode(exception);
        
        // 실패 응답 생성
        ApiResponse<Object> apiResponse = ApiResponse.error(errorMessage, errorCode);
        
        // JSON 응답 작성
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
    
    /**
     * 예외 타입별 에러 메시지 반환
     * 
     * @param exception 인증 예외
     * @return 에러 메시지
     */
    private String getErrorMessage(AuthenticationException exception) {
        if (exception instanceof BadCredentialsException) {
            return "아이디 또는 비밀번호가 올바르지 않습니다.";
        } else if (exception instanceof UsernameNotFoundException) {
            return "존재하지 않는 사용자입니다.";
        } else if (exception instanceof DisabledException) {
            return "비활성화된 계정입니다.";
        } else if (exception instanceof LockedException) {
            return "잠긴 계정입니다.";
        } else {
            return "로그인에 실패했습니다.";
        }
    }
    
    /**
     * 예외 타입별 에러 코드 반환
     * 
     * @param exception 인증 예외
     * @return 에러 코드
     */
    private String getErrorCode(AuthenticationException exception) {
        if (exception instanceof BadCredentialsException) {
            return "INVALID_CREDENTIALS";
        } else if (exception instanceof UsernameNotFoundException) {
            return "USER_NOT_FOUND";
        } else if (exception instanceof DisabledException) {
            return "ACCOUNT_DISABLED";
        } else if (exception instanceof LockedException) {
            return "ACCOUNT_LOCKED";
        } else {
            return "AUTHENTICATION_FAILED";
        }
    }
} 