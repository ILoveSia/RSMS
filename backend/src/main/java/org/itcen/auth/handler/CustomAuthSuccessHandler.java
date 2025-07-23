package org.itcen.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * 인증 성공 핸들러
 * 
 * 단일 책임 원칙: 인증 성공 처리만 담당
 * 개방-폐쇄 원칙: 새로운 성공 처리 로직 추가 시 확장 가능
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthSuccessHandler implements AuthenticationSuccessHandler {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        // 응답 설정
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        
        // 성공 응답 생성
        ApiResponse<Object> apiResponse = ApiResponse.success(
            "로그인이 성공적으로 완료되었습니다."
        );
        
        // JSON 응답 작성
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
} 