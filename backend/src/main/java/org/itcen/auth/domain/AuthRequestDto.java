package org.itcen.auth.domain;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 인증 관련 요청 DTO 클래스
 * 
 * 단일 책임 원칙: 각 내부 클래스는 특정 요청 타입만 담당
 * 인터페이스 분리 원칙: 필요한 필드만 포함하여 각 요청 타입별로 분리
 */
public class AuthRequestDto {
    
    /**
     * 로그인 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        
        /**
         * 사용자 ID
         */
        @NotBlank(message = "사용자 ID는 필수입니다.")
        @Size(min = 3, max = 100, message = "사용자 ID는 3-100자 사이여야 합니다.")
        private String userid;

        /**
         * 비밀번호
         */
        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, max = 255, message = "비밀번호는 8-255자 사이여야 합니다.")
        private String password;
        
        /**
         * 로그인 상태 유지 여부
         */
        @Builder.Default
        private Boolean rememberMe = false;
    }
    
    /**
     * 회원가입 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignupRequest {
        
        /**
         * 사용자 ID
         */
        @NotBlank(message = "사용자 ID는 필수입니다.")
        @Size(min = 3, max = 100, message = "사용자 ID는 3-100자 사이여야 합니다.")
        @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "사용자 ID는 영문, 숫자, 언더스코어, 하이픈만 사용 가능합니다.")
        private String id;
        
        /**
         * 사번
         */
        @NotBlank(message = "사번은 필수입니다.")
        @Size(min = 2, max = 100, message = "사번은 2-100자 사이여야 합니다.")
        private String empNo;
        
        /**
         * 이메일
         */
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
        private String email;
        
        /**
         * 비밀번호
         */
        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, max = 255, message = "비밀번호는 8-255자 사이여야 합니다.")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", 
                message = "비밀번호는 대소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.")
        private String password;
        
        /**
         * 비밀번호 확인
         */
        @NotBlank(message = "비밀번호 확인은 필수입니다.")
        private String confirmPassword;
        
        /**
         * 주소
         */
        @NotBlank(message = "주소는 필수입니다.")
        @Size(min = 5, max = 255, message = "주소는 5-255자 사이여야 합니다.")
        private String address;
        
        /**
         * 휴대폰 번호
         */
        @NotBlank(message = "휴대폰 번호는 필수입니다.")
        @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
        @Size(max = 20, message = "휴대폰 번호는 20자를 초과할 수 없습니다.")
        private String mobile;
        
        /**
         * 비밀번호 일치 여부 검증
         * 
         * @return 비밀번호 일치 여부
         */
        public boolean isPasswordMatching() {
            return password != null && password.equals(confirmPassword);
        }
    }
    
    /**
     * 비밀번호 변경 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        
        /**
         * 현재 비밀번호
         */
        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        private String currentPassword;
        
        /**
         * 새 비밀번호
         */
        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Size(min = 8, max = 255, message = "새 비밀번호는 8-255자 사이여야 합니다.")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", 
                message = "새 비밀번호는 대소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.")
        private String newPassword;
        
        /**
         * 새 비밀번호 확인
         */
        @NotBlank(message = "새 비밀번호 확인은 필수입니다.")
        private String confirmNewPassword;
        
        /**
         * 새 비밀번호 일치 여부 검증
         * 
         * @return 새 비밀번호 일치 여부
         */
        public boolean isNewPasswordMatching() {
            return newPassword != null && newPassword.equals(confirmNewPassword);
        }
    }
} 