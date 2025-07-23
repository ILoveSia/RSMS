package org.itcen.auth.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 인증 필터
 * 
 * 단일 책임 원칙: JWT 토큰 검증만 담당
 * 개방-폐쇄 원칙: JWT 검증 로직 변경 시 확장 가능
 * 
 * 현재는 세션 기반 인증을 사용하므로 비활성화 상태
 * 향후 JWT 인증으로 전환 시 활성화 예정
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    // JWT 관련 서비스들 (향후 구현 예정)
    // private final JwtTokenProvider jwtTokenProvider;
    // private final UserDetailsService userDetailsService;
    
    /**
     * JWT 토큰 검증 및 인증 처리
     * 
     * 현재는 세션 기반 인증을 사용하므로 필터를 통과만 시킴
     * 향후 JWT 인증 구현 시 이 메서드에서 토큰 검증 로직 추가
     * 
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param filterChain 필터 체인
     * @throws ServletException 서블릿 예외
     * @throws IOException IO 예외
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // TODO: JWT 인증 구현 시 아래 로직 활성화
        /*
        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("JWT 인증 성공: {}", username);
            }
        } catch (Exception e) {
            log.error("JWT 인증 처리 중 오류 발생", e);
            SecurityContextHolder.clearContext();
        }
        */
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 요청에서 JWT 토큰 추출
     * 
     * @param request HTTP 요청
     * @return JWT 토큰 (없으면 null)
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    
    /**
     * 필터를 적용하지 않을 경로 설정
     * 
     * @param request HTTP 요청
     * @return 필터 적용 여부 (true: 적용 안함, false: 적용)
     */
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