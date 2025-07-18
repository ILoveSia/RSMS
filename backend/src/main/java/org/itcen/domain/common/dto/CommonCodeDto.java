package org.itcen.domain.common.dto;

import org.itcen.domain.common.entity.CommonCode;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 공통코드 관련 DTO 클래스들
 * 
 * 공통코드 데이터 전송을 위한 DTO들을 포함합니다.
 * 각 DTO는 단일 책임을 가지며, 용도에 따라 분리되어 있습니다.
 */
public class CommonCodeDto {

    /**
     * 공통코드 응답용 DTO
     * 
     * 클라이언트에게 공통코드 정보를 전달하기 위한 DTO입니다.
     * 엔티티의 모든 정보를 포함하되, 불필요한 내부 구현 세부사항은 숨깁니다.
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String groupCode;
        private String code;
        private String codeName;
        private String description;
        private Integer sortOrder;
        private String useYn;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        /**
         * 엔티티를 DTO로 변환하는 정적 팩토리 메서드
         * 
         * @param commonCode 변환할 공통코드 엔티티
         * @return 변환된 응답 DTO
         */
        public static Response from(CommonCode commonCode) {
            return Response.builder()
                    .groupCode(commonCode.getGroupCode())
                    .code(commonCode.getCode())
                    .codeName(commonCode.getCodeName())
                    
                    .description(commonCode.getDescription())
                    .sortOrder(commonCode.getSortOrder())
                    .useYn(commonCode.getUseYn())
                    .createdAt(commonCode.getCreatedAt())
                    .updatedAt(commonCode.getUpdatedAt())
                    .build();
        }

        /**
         * 사용 가능한 코드인지 확인
         * 
         * @return 사용 가능 여부
         */
        public boolean isUsable() {
            return "Y".equals(this.useYn);
        }
    }

    /**
     * 공통코드 검색 요청 DTO
     * 
     * 공통코드 조회 시 검색 조건을 담는 DTO입니다.
     * 다양한 검색 조건을 지원하여 유연한 조회가 가능합니다.
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        private String groupCode;
        private String code;
        private String codeName;
        private String useYn;
        private String sortBy = "sortOrder"; // 기본 정렬 기준
        private String sortDirection = "ASC"; // 기본 정렬 방향

        /**
         * 그룹코드 검색 조건이 있는지 확인
         * 
         * @return 그룹코드 검색 조건 존재 여부
         */
        public boolean hasGroupCode() {
            return groupCode != null && !groupCode.trim().isEmpty();
        }

        /**
         * 코드 검색 조건이 있는지 확인
         * 
         * @return 코드 검색 조건 존재 여부
         */
        public boolean hasCode() {
            return code != null && !code.trim().isEmpty();
        }

        /**
         * 코드명 검색 조건이 있는지 확인
         * 
         * @return 코드명 검색 조건 존재 여부
         */
        public boolean hasCodeName() {
            return codeName != null && !codeName.trim().isEmpty();
        }

        /**
         * 사용여부 검색 조건이 있는지 확인
         * 
         * @return 사용여부 검색 조건 존재 여부
         */
        public boolean hasUseYn() {
            return useYn != null && !useYn.trim().isEmpty();
        }
    }

    /**
     * 그룹별 공통코드 응답 DTO
     * 
     * 그룹코드별로 공통코드 목록을 그룹화하여 반환하는 DTO입니다.
     * 클라이언트에서 그룹별로 코드를 사용할 때 편리합니다.
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupResponse {
        private String groupCode;
        private String groupName;
        private List<Response> codes;

        /**
         * 그룹 내 코드 개수 반환
         * 
         * @return 코드 개수
         */
        public int getCodeCount() {
            return codes != null ? codes.size() : 0;
        }

        /**
         * 사용 가능한 코드만 필터링하여 반환
         * 
         * @return 사용 가능한 코드 목록
         */
        public List<Response> getUsableCodes() {
            return codes != null ? 
                codes.stream()
                     .filter(Response::isUsable)
                     .toList() : 
                List.of();
        }
    }

    /**
     * 공통코드 생성 요청 DTO
     * 
     * 새로운 공통코드 생성 시 사용하는 DTO입니다.
     * 필수 필드에 대한 검증을 포함합니다.
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String groupCode;
        private String code;
        private String codeName;
        private String description;
        private Integer sortOrder;
        private String useYn;

        /**
         * 엔티티로 변환하는 메서드
         * 
         * @return 변환된 공통코드 엔티티
         */
        public CommonCode toEntity() {
            return CommonCode.builder()
                    .groupCode(this.groupCode)
                    .code(this.code)
                    .codeName(this.codeName)
                    .description(this.description)
                    .sortOrder(this.sortOrder)
                    .useYn(this.useYn)
                    .build();
        }

        /**
         * 필수 필드 검증
         * 
         * @return 검증 통과 여부
         */
        public boolean isValid() {
            return groupCode != null && !groupCode.trim().isEmpty() &&
                   code != null && !code.trim().isEmpty() &&
                   codeName != null && !codeName.trim().isEmpty();
        }
    }
} 