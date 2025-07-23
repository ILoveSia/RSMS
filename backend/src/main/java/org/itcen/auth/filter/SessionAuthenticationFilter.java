package org.itcen.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

/**
 * 세션 기반 인증 필터
 * 
 * 단일 책임 원칙: 세션 기반 인증 처리만 담당
 * 개방-폐쇄 원칙: 인증 로직 변경 시 확장 가능
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            HttpSession session = request.getSession(false);
            
            if (session != null) {
                String userId = (String) session.getAttribute("userId");
                String username = (String) session.getAttribute("username");
                @SuppressWarnings("unchecked")
                Collection<? extends GrantedAuthority> authorities = 
                    (Collection<? extends GrantedAuthority>) session.getAttribute("authorities");
                
                if (username != null && authorities != null) {
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                        username, null, authorities
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            log.error("세션 인증 처리 중 오류 발생", e);
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // 인증이 필요하지 않은 경로들
        return path.startsWith("/auth/login") ||
               path.startsWith("/auth/signup") ||
               path.startsWith("/auth/status") ||
               path.startsWith("/h2-console") ||
               path.startsWith("/actuator") ||
               path.startsWith("/error");
    }
} 