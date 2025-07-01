# 로그인 API 처리 흐름 분석

## 개요
LoginPage.tsx에서 `http://localhost:8080/api/auth/login` API를 호출했을 때 백엔드에서 순차적으로 이동하는 경로를 분석한 문서입니다.

## 🔄 API 호출 순서 및 경로

### 1️⃣ **HTTP 요청 진입**
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json
Body: {
  "username": "사용자명",
  "password": "비밀번호",
  "rememberMe": false
}
```

### 2️⃣ **Spring Security Filter Chain 통과**
**파일**: `backend/src/main/java/org/itcen/auth/config/SecurityConfig.java`
```java
// SecurityConfig.java - filterChain()
1. CORS 필터 → CORS 설정 확인 (localhost:3000 허용)
2. CSRF 필터 → 비활성화 상태이므로 통과
3. 세션 관리 필터 → 세션 생성 정책 확인
4. 권한 검사 → "/auth/login"은 permitAll()로 설정되어 통과
```

### 3️⃣ **JWT 인증 필터 (현재 비활성화)**
**파일**: `backend/src/main/java/org/itcen/auth/filter/JwtAuthenticationFilter.java`
```java
// JwtAuthenticationFilter.java - doFilterInternal()
// 현재는 세션 기반 인증 사용으로 JWT 검증 생략
log.debug("JWT 필터 통과 - 현재는 세션 기반 인증 사용 중");
filterChain.doFilter(request, response);
```

### 4️⃣ **컨트롤러 진입**
**파일**: `backend/src/main/java/org/itcen/auth/controller/AuthController.java`
```java
// AuthController.java - login()
@PostMapping("/login")
public ResponseEntity<ApiResponse<AuthResponseDto.LoginResponse>> login(
    @Valid @RequestBody AuthRequestDto.LoginRequest request,
    HttpServletRequest httpRequest)
```

### 5️⃣ **서비스 레이어 호출**
**파일**: `backend/src/main/java/org/itcen/auth/controller/AuthController.java`
```java
// AuthController.java
AuthResponseDto.LoginResponse response = authService.login(request, httpRequest);
```

### 6️⃣ **인증 처리 (AuthService)**
**파일**: `backend/src/main/java/org/itcen/auth/service/AuthService.java`
```java
// AuthService.java - login()
1. AuthenticationManager를 통한 인증 시도
   Authentication authentication = authenticationManager.authenticate(
       new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
   );

2. UserDetailsService 호출 (loadUserByUsername)
   - AuthService.loadUserByUsername() 메서드 실행
```

### 7️⃣ **데이터베이스 조회**
**파일**: `backend/src/main/java/org/itcen/auth/service/AuthService.java`
**파일**: `backend/src/main/java/org/itcen/auth/repository/AuthUserRepository.java`
```java
// AuthService.java - loadUserByUsername()
User user = authUserRepository.findByUsernameOrEmail(usernameOrEmail)
    .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));

// AuthUserRepository.java
@Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
```

### 8️⃣ **비밀번호 검증**
**파일**: `backend/src/main/java/org/itcen/auth/config/SecurityConfig.java`
```java
// Spring Security 내부에서 PasswordEncoder를 통한 비밀번호 검증
// SecurityConfig.java에서 설정한 BCryptPasswordEncoder 사용
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12); // strength 12 (보안 강화)
}
```

### 9️⃣ **인증 성공 시 처리**
**파일**: `backend/src/main/java/org/itcen/auth/service/AuthService.java`
```java
// AuthService.java - login()
1. 세션 생성 및 사용자 정보 저장
   HttpSession session = httpRequest.getSession(true);
   session.setAttribute("userId", user.getId());
   session.setAttribute("username", user.getUsername());
   session.setAttribute("authorities", userDetails.getAuthorities());

2. Remember Me 처리
   if (Boolean.TRUE.equals(request.getRememberMe())) {
       session.setMaxInactiveInterval(30 * 24 * 60 * 60); // 30일
   }

3. 마지막 로그인 시간 업데이트
   authUserRepository.updateLastLoginTime(user.getId(), LocalDateTime.now());

4. 응답 DTO 생성
   return AuthResponseDto.LoginResponse.builder()
       .userId(user.getId())
       .username(user.getUsername())
       .email(user.getEmail())
       .authorities(userDetails.getAuthorities().stream()
               .map(GrantedAuthority::getAuthority)
               .toList())
       .sessionId(session.getId())
       .loginTime(LocalDateTime.now())
       .sessionExpireTime(LocalDateTime.now().plusSeconds(session.getMaxInactiveInterval()))
       .rememberMe(request.getRememberMe())
       .build();
```

### 🔟 **응답 반환**
**파일**: `backend/src/main/java/org/itcen/auth/controller/AuthController.java`
```java
// AuthController.java
return ResponseEntity.ok(
    ApiResponse.success(response, "로그인이 완료되었습니다.")
);
```

### 1️⃣1️⃣ **인증 실패 시 처리**
**파일**: `backend/src/main/java/org/itcen/auth/handler/CustomAuthFailureHandler.java`
```java
// 인증 실패 시 CustomAuthFailureHandler 호출
// CustomAuthFailureHandler.java - onAuthenticationFailure()
response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
response.setContentType("application/json;charset=UTF-8");

// 실패 사유별 메시지 설정
String errorMessage = getErrorMessage(exception);
String errorCode = getErrorCode(exception);

// 실패 응답 생성
ApiResponse<Object> apiResponse = ApiResponse.error(errorMessage, errorCode);
response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
```

## 📋 요약된 호출 순서

| 순서 | 컴포넌트 | 파일 위치 | 주요 역할 |
|------|----------|-----------|-----------|
| 1 | HTTP 요청 | - | POST /api/auth/login |
| 2 | Spring Security Filter Chain | `SecurityConfig.java` | CORS, CSRF, 세션, 권한 검사 |
| 3 | JWT 필터 | `JwtAuthenticationFilter.java` | 현재 비활성화 (세션 기반 인증) |
| 4 | AuthController | `AuthController.java` | HTTP 요청 처리 |
| 5 | AuthService | `AuthService.java` | 비즈니스 로직 처리 |
| 6 | AuthenticationManager | Spring Security 내부 | 인증 처리 |
| 7 | UserDetailsService | `AuthService.java` | 사용자 정보 로드 |
| 8 | AuthUserRepository | `AuthUserRepository.java` | 데이터베이스 조회 |
| 9 | PasswordEncoder | Spring Security 내부 | 비밀번호 검증 |
| 10 | 세션 생성 | `AuthService.java` | 세션 및 사용자 정보 저장 |
| 11 | DB 업데이트 | `AuthUserRepository.java` | 마지막 로그인 시간 업데이트 |
| 12 | 응답 반환 | `AuthController.java` | 성공/실패 응답 |

## 🔧 주요 설정 파일

### 1. 보안 설정
- **파일**: `backend/src/main/java/org/itcen/auth/config/SecurityConfig.java`
- **역할**: Spring Security 설정, CORS, 세션 관리, 권한 설정

### 2. 웹 설정
- **파일**: `backend/src/main/java/org/itcen/config/WebConfig.java`
- **역할**: CORS 추가 설정, ObjectMapper 설정

### 3. 애플리케이션 설정
- **파일**: `backend/src/main/resources/application.yml`
- **역할**: 서버 포트, 데이터베이스, 세션, CORS 기본 설정

## 🎯 인증 성공/실패 핸들러

### 성공 핸들러
- **파일**: `backend/src/main/java/org/itcen/auth/handler/CustomAuthSuccessHandler.java`
- **역할**: 인증 성공 시 JSON 응답 처리

### 실패 핸들러
- **파일**: `backend/src/main/java/org/itcen/auth/handler/CustomAuthFailureHandler.java`
- **역할**: 인증 실패 시 에러 메시지 및 JSON 응답 처리

## 📊 DTO 구조

### 요청 DTO
- **파일**: `backend/src/main/java/org/itcen/auth/domain/AuthRequestDto.java`
- **클래스**: `AuthRequestDto.LoginRequest`

### 응답 DTO
- **파일**: `backend/src/main/java/org/itcen/auth/domain/AuthResponseDto.java`
- **클래스**: `AuthResponseDto.LoginResponse`

## 🔍 로그 추적 포인트

로그인 과정에서 다음 로그들을 통해 처리 상황을 추적할 수 있습니다:

1. **AuthController**: `log.info("로그인 API 호출: {}", request.getUsername());`
2. **AuthService**: `log.info("로그인 시도: {}", request.getUsername());`
3. **AuthService**: `log.debug("사용자 인증 정보 조회: {}", usernameOrEmail);`
4. **AuthService**: `log.info("로그인 성공: {} (Session ID: {})", user.getUsername(), session.getId());`
5. **CustomAuthFailureHandler**: `log.warn("인증 실패: {}", exception.getMessage());`

## 🚨 주의사항

1. **현재 JWT 필터는 비활성화** 상태이며, 세션 기반 인증을 사용합니다.
2. **CORS 설정**은 `localhost:3000`만 허용하도록 설정되어 있습니다.
3. **세션 동시 접속**은 1개로 제한되어 있으며, 새 로그인 시 기존 세션이 만료됩니다.
4. **비밀번호 암호화**는 BCrypt 알고리즘(strength 12)을 사용합니다. 