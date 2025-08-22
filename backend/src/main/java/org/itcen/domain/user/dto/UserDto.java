package org.itcen.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.user.entity.User;

import jakarta.validation.constraints.NotBlank;
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
    @Builder(toBuilder = true)
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String username;
        private String empNo;
        
        // Employee 테이블에서 조회되는 추가 정보
        private String departmentName;
        private String positionName;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;

        /**
         * Entity를 Response DTO로 변환 (Employee 정보 포함)
         */
        public static Response from(User user, String departmentName, String positionName) {
            return Response.builder()
                    .id(user.getId())
                    .username(null) // username은 별도로 설정 (Employee empName 사용)
                    .empNo(user.getEmpNo())
                    .departmentName(departmentName)
                    .positionName(positionName)
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        }
        
        /**
         * Entity를 Response DTO로 변환 (Employee 정보 없는 경우)
         */
        public static Response from(User user) {
            return from(user, null, null);
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

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, max = 255, message = "비밀번호는 8-255자 사이여야 합니다.")
        private String password;

        @Size(max = 100, message = "사번은 100자를 초과할 수 없습니다.")
        private String empNo;

        // @Size(max = 100, message = "직책코드는 100자를 초과할 수 없습니다.")
        // private String jobTitleCd;

        /**
         * CreateRequest를 Entity로 변환
         */
        public User toEntity() {
            return User.builder()
                    .id(this.id)
                    .password(this.password) // 서비스에서 암호화 처리
                    .empNo(this.empNo)
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
        @Size(min = 3, max = 50, message = "사용자명은 3-50자 사이여야 합니다.")
        private String username;
        
        @Size(max = 100, message = "사번은 100자를 초과할 수 없습니다.")
        private String empNo;

        // @Size(max = 100, message = "직책코드는 100자를 초과할 수 없습니다.")
        // private String jobTitleCd;
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
        private String empNo;
        private String departmentName;
        private String positionName;
        
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
        private String empNo;
        private String departmentName;
        private String positionName;
        
        @Builder.Default
        private int limit = 100;
    }
} 