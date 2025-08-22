package org.itcen.auth.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.menu.dto.MenuDto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 인증 관련 응답 DTO 클래스
 * 
 * 단일 책임 원칙: 각 내부 클래스는 특정 응답 타입만 담당
 * 인터페이스 분리 원칙: 필요한 필드만 포함하여 각 응답 타입별로 분리
 */
public class AuthResponseDto {
    
    /**
     * 로그인 성공 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        
        /**
         * 사용자 ID
         */
        private String userId;
        
        /**
         * 사원명 (employee.emp_name)
         */
        private String username;
        
        /**
         * 사번 (users.emp_no)
         */
        private String empNo;
        
        /**
         * 부서코드 (employee.dept_code)
         */
        private String deptCd;
        
        /**
         * 직급코드 (employee.position_code)
         */
        private String positionCode;
        
        /**
         * 사용자 권한 목록
         */
        private List<String> authorities;
        
        /**
         * 세션 ID
         */
        private String sessionId;
        
        /**
         * 로그인 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime loginTime;
        
        /**
         * 세션 만료 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime sessionExpireTime;
        
        /**
         * 로그인 상태 유지 여부
         */
        private Boolean rememberMe;
        
        /**
         * 사용자 접근 가능한 메뉴 목록
         */
        private List<MenuDto> accessibleMenus;
    }
    
    /**
     * 회원가입 성공 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignupResponse {
        
        /**
         * 생성된 사용자 ID
         */
        private String userId;
        
        /**
         * 사용자명
         */
        private String username;
        
        /**
         * 가입 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime signupTime;
        
        /**
         * 기본 권한 목록
         */
        private List<String> authorities;
    }
    
    /**
     * 사용자 정보 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfoResponse {
        
        /**
         * 사용자 ID
         */
        private String userId;
        
        /**
         * 사원명 (employee.emp_name)
         */
        private String username;
        
        /**
         * 사번 (users.emp_no)
         */
        private String empNo;
        
        /**
         * 부서코드 (employee.dept_code)
         */
        private String deptCd;
        
        /**
         * 직급코드 (employee.position_code)
         */
        private String positionCode;
        
        /**
         * 사용자 권한 목록
         */
        private List<String> authorities;
        
        /**
         * 계정 생성 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
        
        /**
         * 마지막 수정 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
        
        /**
         * 마지막 로그인 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastLoginTime;
    }
    
    /**
     * 세션 정보 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionInfoResponse {
        
        /**
         * 세션 ID
         */
        private String sessionId;
        
        /**
         * 사용자 ID
         */
        private String userId;
        
        /**
         * 세션 생성 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdTime;
        
        /**
         * 마지막 접근 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastAccessedTime;
        
        /**
         * 세션 만료 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime expireTime;
        
        /**
         * 세션 활성 여부
         */
        private Boolean active;
        
        /**
         * 최대 비활성 간격 (초)
         */
        private Integer maxInactiveInterval;
    }
    
    /**
     * 로그아웃 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogoutResponse {
        
        /**
         * 로그아웃된 사용자 ID
         */
        private String userId;
        
        /**
         * 로그아웃 시간
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime logoutTime;
        
        /**
         * 로그아웃 메시지
         */
        private String message;
    }
} 