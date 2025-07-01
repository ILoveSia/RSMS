package org.itcen.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.user.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 사용자 DTO 클래스
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 데이터 전송만 담당
 * - Open/Closed: 새로운 DTO 타입 추가 시 확장 가능
 */
public class UserDto {

    /**
     * 사용자 응답 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String username;
        private String email;
        private String address;
        private String mobile;
        private String deptCd;
        private String num;
        private String jobRankCd;
        private String jobTitleCd;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;

        /**
         * Entity를 Response DTO로 변환
         */
        public static Response from(User user) {
            return Response.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .address(user.getAddress())
                    .mobile(user.getMobile())
                    .deptCd(user.getDeptCd())
                    .num(user.getNum())
                    .jobRankCd(user.getJobRankCd())
                    .jobTitleCd(user.getJobTitleCd())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        }
    }

    /**
     * 사용자 생성 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        
        @NotBlank(message = "ID는 필수입니다.")
        @Size(min = 3, max = 100, message = "ID는 3-100자 사이여야 합니다.")
        private String id;
        
        @NotBlank(message = "사용자명은 필수입니다.")
        @Size(min = 3, max = 50, message = "사용자명은 3-50자 사이여야 합니다.")
        private String username;

        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
        private String email;

        @NotBlank(message = "주소는 필수입니다.")
        @Size(min = 5, max = 255, message = "주소는 5-255자 사이여야 합니다.")
        private String address;

        @NotBlank(message = "휴대폰 번호는 필수입니다.")
        @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
        @Size(max = 20, message = "휴대폰 번호는 20자를 초과할 수 없습니다.")
        private String mobile;

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, max = 255, message = "비밀번호는 8-255자 사이여야 합니다.")
        private String password;

        @Size(max = 100, message = "부서코드는 100자를 초과할 수 없습니다.")
        private String deptCd;

        @Size(max = 100, message = "사번은 100자를 초과할 수 없습니다.")
        private String num;

        @Size(max = 100, message = "직급코드는 100자를 초과할 수 없습니다.")
        private String jobRankCd;

        @Size(max = 100, message = "직책코드는 100자를 초과할 수 없습니다.")
        private String jobTitleCd;

        /**
         * CreateRequest를 Entity로 변환
         */
        public User toEntity() {
            return User.builder()
                    .id(this.id)
                    .username(this.username)
                    .email(this.email)
                    .address(this.address)
                    .mobile(this.mobile)
                    .password(this.password) // 실제로는 암호화 필요
                    .deptCd(this.deptCd)
                    .num(this.num)
                    .jobRankCd(this.jobRankCd)
                    .jobTitleCd(this.jobTitleCd)
                    .build();
        }
    }

    /**
     * 사용자 수정 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        
        @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;

        @Size(min = 5, max = 255, message = "주소는 5-255자 사이여야 합니다.")
        private String address;

        @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
        @Size(max = 20, message = "휴대폰 번호는 20자를 초과할 수 없습니다.")
        private String mobile;

        @Size(max = 100, message = "부서코드는 100자를 초과할 수 없습니다.")
        private String deptCd;

        @Size(max = 100, message = "사번은 100자를 초과할 수 없습니다.")
        private String num;

        @Size(max = 100, message = "직급코드는 100자를 초과할 수 없습니다.")
        private String jobRankCd;

        @Size(max = 100, message = "직책코드는 100자를 초과할 수 없습니다.")
        private String jobTitleCd;
    }

    /**
     * 사용자 목록 조회 요청 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        private String username;
        private String email;
        private String address;
        private String mobile;
        private String deptCd;
        private String num;
        private String jobRankCd;
        private String jobTitleCd;
        
        @Builder.Default
        private int page = 0;
        
        @Builder.Default
        private int size = 20;
        
        @Builder.Default
        private String sort = "createdAt";
        
        @Builder.Default
        private String direction = "desc";
    }

    /**
     * 사원 목록 조회 요청 DTO (팝업용)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeSearchRequest {
        private String username;
        private String num;
        private String deptCd;
        private String jobRankCd;
        
        @Builder.Default
        private int limit = 100;
    }
} 