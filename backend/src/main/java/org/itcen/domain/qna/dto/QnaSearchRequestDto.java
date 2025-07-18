package org.itcen.domain.qna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.qna.entity.QnaPriority;
import org.itcen.domain.qna.entity.QnaStatus;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Q&A 검색 요청 DTO
 * 
 * Q&A 목록 조회 시 검색 조건을 담는 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 검색 조건만 담당
 * - Open/Closed: 새로운 검색 조건 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaSearchRequestDto {

    /**
     * 검색 키워드 (제목, 내용에서 검색)
     */
    private String keyword;

    /**
     * 담당업무/부서
     */
    private String department;

    /**
     * 상태
     */
    private QnaStatus status;

    /**
     * 우선순위
     */
    private QnaPriority priority;

    /**
     * 카테고리
     */
    private String category;

    /**
     * 질문자 이름
     */
    private String questionerName;

    /**
     * 답변자 이름
     */
    private String answererName;

    /**
     * 공개여부
     */
    private Boolean isPublic;

    /**
     * 검색 시작일
     */
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    /**
     * 검색 종료일
     */
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    /**
     * 페이지 번호 (0부터 시작)
     */
    @Builder.Default
    private Integer page = 0;

    /**
     * 페이지 크기
     */
    @Builder.Default
    private Integer size = 10;

    /**
     * 정렬 기준 (createdAt, updatedAt, viewCount 등)
     */
    @Builder.Default
    private String sortBy = "createdAt";

    /**
     * 정렬 방향 (asc, desc)
     */
    @Builder.Default
    private String sortDirection = "desc";

    /**
     * 검색 조건이 있는지 확인하는 메서드
     * 
     * @return 검색 조건 존재 여부
     */
    public boolean hasSearchCondition() {
        return (keyword != null && !keyword.trim().isEmpty()) ||
               (department != null && !department.trim().isEmpty()) ||
               status != null ||
               priority != null ||
               (category != null && !category.trim().isEmpty()) ||
               (questionerName != null && !questionerName.trim().isEmpty()) ||
               (answererName != null && !answererName.trim().isEmpty()) ||
               isPublic != null ||
               startDate != null ||
               endDate != null;
    }

    /**
     * 데이터 정제 메서드
     * 앞뒤 공백 제거 및 기본값 설정
     */
    public void sanitize() {
        if (keyword != null) {
            keyword = keyword.trim();
            if (keyword.isEmpty()) {
                keyword = null;
            }
        }
        if (department != null) {
            department = department.trim();
            if (department.isEmpty()) {
                department = null;
            }
        }
        if (category != null) {
            category = category.trim();
            if (category.isEmpty()) {
                category = null;
            }
        }
        if (questionerName != null) {
            questionerName = questionerName.trim();
            if (questionerName.isEmpty()) {
                questionerName = null;
            }
        }
        if (answererName != null) {
            answererName = answererName.trim();
            if (answererName.isEmpty()) {
                answererName = null;
            }
        }
        if (page == null || page < 0) {
            page = 0;
        }
        if (size == null || size <= 0) {
            size = 10;
        }
        if (size > 100) {
            size = 100; // 최대 100개로 제한
        }
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "createdAt";
        }
        if (sortDirection == null || (!sortDirection.equalsIgnoreCase("asc") && !sortDirection.equalsIgnoreCase("desc"))) {
            sortDirection = "desc";
        }
    }

    /**
     * 날짜 범위 유효성 검증 메서드
     * 
     * @return 날짜 범위 유효성
     */
    public boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true; // null인 경우는 유효한 것으로 간주
        }
        return !startDate.isAfter(endDate);
    }
}