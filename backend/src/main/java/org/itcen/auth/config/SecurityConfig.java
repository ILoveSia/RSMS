package org.itcen.auth.config;

import java.util.Arrays;
import org.itcen.auth.filter.SessionAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import lombok.RequiredArgsConstructor;

/**
 * Spring Security 설정 클래스
 *
 * 단일 책임 원칙: 보안 설정만 담당
 * 개방-폐쇄 원칙: 새로운 보안 정책 추가 시 확장 가능
 * 의존성 역전 원칙: 인터페이스에 의존하여 구현체 변경 가능
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final SessionAuthenticationFilter sessionAuthenticationFilter;

    /**
     * 비밀번호 인코더 Bean 설정
     * BCrypt 알고리즘 사용 (강력한 해시 함수)
     *
     * @return BCrypt 비밀번호 인코더
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // strength 12 (보안 강화)
    }

    /**
     * 인증 매니저 Bean 설정 제거
     * 직접 인증 방식을 사용하므로 AuthenticationManager 불필요
     */
    // @Bean - 직접 인증 방식 사용으로 주석 처리
    // public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    //     return config.getAuthenticationManager();
    // }

    /**
     * DAO 인증 제공자 설정 제거
     * 직접 인증 방식을 사용하므로 DaoAuthenticationProvider 불필요
     * AuthService에서 직접 사용자 조회 및 비밀번호 검증 수행
     */
    // @Bean - 직접 인증 방식 사용으로 주석 처리
    // public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
    //     DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    //     authProvider.setUserDetailsService(userDetailsService);
    //     authProvider.setPasswordEncoder(passwordEncoder());
    //     authProvider.setHideUserNotFoundExceptions(false);
    //     return authProvider;
    // }

    /**
     * 보안 필터 체인 설정
     *
     * @param http HTTP 보안 설정
     * @return 보안 필터 체인
     * @throws Exception 설정 오류 시
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API에서는 일반적으로 비활성화)
            .csrf(AbstractHttpConfigurer::disable)

            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 세션 관리 설정
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1) // 동시 세션 1개로 제한
                .maxSessionsPreventsLogin(false) // 새 로그인 시 기존 세션 만료
                .sessionRegistry(sessionRegistry())
            )

            // 세션 인증 필터 추가
            .addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

            // 요청 권한 설정
            .authorizeHttpRequests(authz -> authz
                // 인증 없이 접근 가능한 경로
                .requestMatchers(
                    "/auth/**",
                    "/h2-console/**",
                    "/actuator/**",
                    "/error",
                    // Q&A 공개 API
                    "/qna/recent",
                    "/qna/popular",
                    "/qna/statistics/**",
                    "/qna/debug/**",
                    // 회의체 API (임시로 모든 접근 허용, 나중에 인증 추가 가능)
                    "/meeting-bodies/**",
                    // 메뉴 API
                    "/menus/**",
                    // 공통코드 API (로그인 시 필요한 기본 데이터)
                    "/common-codes/**",
                    // 첨부파일 API (로그인 시 필요한 기능)
                    "/attachments/**",
                    "/common/attachments/**",
                    // Case Study API (공개 접근 허용)
                    "/case-studies/**",
                    // 원장차수+진행상태 셀렉트박스용 API (공개 접근 허용)
                    "/ledger-orders/select-list",
                    "/ledger-orders-hod/select-list",
                    // 책무구조도 제출 API (개발 편의를 위해 임시 허용)
                    "/submissions/**",
                    // 결재 API (개발 편의를 위해 임시 허용)
                    "/approval-system/**",
                    // 메인 대시보드 API (개발 편의를 위해 임시 허용)
                    "/main/**",
                    // 임원 API (개발 편의를 위해 임시 허용)
                    "/execofficer/**",
                    // 관리자 API 중 로그인 페이지에서 사용하는 사용자 목록 조회 허용
                    "/admin/users"
            ).permitAll()

            // 모든 API 엔드포인트는 인증 필요 (일반화)
            // .requestMatchers("/api/execofficer").permitAll()

            // 관리자 권한이 필요한 경로
            .requestMatchers("/auth/sessions/count").hasRole("ADMIN")

            // 사용자 관련 API (인증 후 접근 가능)
            .requestMatchers("/users/**").authenticated()

                // 나머지 모든 요청은 인증 필요
                .anyRequest().authenticated()
            )

            // 폼 로그인 비활성화 (REST API 직접 인증 사용)
            // .formLogin(form -> form
            //     .loginPage("/auth/login")
            //     .loginProcessingUrl("/auth/login")
            //     .successHandler(customAuthSuccessHandler)
            //     .failureHandler(customAuthFailureHandler)
            //     .permitAll()
            // )

            // 로그아웃 설정
            .logout(logout -> logout
                .logoutUrl("/auth/logout")
                .logoutSuccessUrl("/auth/login?logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )

            // 예외 처리 설정
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"인증이 필요합니다.\",\"error\":{\"code\":\"AUTHENTICATION_REQUIRED\"}}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"접근 권한이 없습니다.\",\"error\":{\"code\":\"ACCESS_DENIED\"}}"
                    );
                })
            )

            // H2 콘솔 접근을 위한 헤더 설정
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
            );

        // 인증 제공자는 자동으로 설정됨

        return http.build();
    }

    /**
     * CORS 설정
     *
     * @return CORS 설정 소스
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 Origin 설정
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",    // Frontend 개발 서버
            "http://127.0.0.1:3000"
        ));

        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        // 노출할 헤더
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));

        // 자격 증명 허용 (쿠키, 인증 헤더 등)
        configuration.setAllowCredentials(true);

        // 프리플라이트 요청 캐시 시간 (초)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * 세션 레지스트리 Bean 설정
     * 동시 세션 관리를 위한 설정
     *
     * @return 세션 레지스트리
     */
    @Bean
    public org.springframework.security.core.session.SessionRegistry sessionRegistry() {
        return new org.springframework.security.core.session.SessionRegistryImpl();
    }

    /**
     * 세션 인증 전략 Bean 설정
     *
     * @return 세션 인증 전략
     */
    @Bean
    public org.springframework.security.web.authentication.session.SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new org.springframework.security.web.authentication.session.ConcurrentSessionControlAuthenticationStrategy(
            sessionRegistry()
        );
    }
}
