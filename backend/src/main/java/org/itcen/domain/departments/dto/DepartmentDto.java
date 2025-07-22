package org.itcen.domain.departments.dto;

import lombok.*;
import org.itcen.domain.departments.entity.Department;

import java.time.LocalDateTime;

/**
 * 부서 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentDto {

    private String departmentId;
    private String departmentName;
    private String useYn;
    private boolean isActive;
    private String createdId;
    private String updatedId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Entity를 DTO로 변환
     */
    public static DepartmentDto from(Department department) {
        return DepartmentDto.builder()
                .departmentId(department.getDepartmentId())
                .departmentName(department.getDepartmentName())
                .useYn(department.getUseYn())
                .isActive(department.isActive())
                .createdId(department.getCreatedId())
                .updatedId(department.getUpdatedId())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }

    /**
     * 부서 생성 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequestDto {
        private String departmentId;
        private String departmentName;
        private String useYn;

        /**
         * DTO를 Entity로 변환
         */
        public Department toEntity() {
            return Department.builder()
                    .departmentId(this.departmentId)
                    .departmentName(this.departmentName)
                    .useYn(this.useYn != null ? this.useYn : "Y")
                    .build();
        }
    }

    /**
     * 부서 수정 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequestDto {
        private String departmentName;
        private String useYn;
    }

    /**
     * 부서 검색 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchRequestDto {
        private String keyword;
        private String useYn;
        private int page;
        private int size;
    }

    /**
     * 부서 간단 정보 DTO (프론트엔드 호환)
     */
}
