package org.itcen.domain.qna.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Q&A 월별 통계 DTO
 * 
 * Q&A 월별 통계 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 월별 통계 데이터 전송만 담당
 * - Open/Closed: 새로운 통계 필드 추가 시 확장 가능
 */
@Data
@Builder
public class QnaMonthlyStatisticsDto {

    /**
     * 년월 (yyyy-MM 형식)
     */
    private String month;

    /**
     * 부서명
     */
    private String department;

    /**
     * 질문 개수
     */
    private Long questionCount;

    /**
     * 답변 개수
     */
    private Long answerCount;

    /**
     * 답변 대기 개수
     */
    private Long pendingCount;

    /**
     * 기본 생성자
     */
    public QnaMonthlyStatisticsDto() {
    }

    /**
     * 모든 필드를 받는 생성자
     */
    public QnaMonthlyStatisticsDto(String month, String department, Long questionCount, Long answerCount, Long pendingCount) {
        this.month = month;
        this.department = department;
        this.questionCount = questionCount;
        this.answerCount = answerCount;
        this.pendingCount = pendingCount;
    }

    /**
     * JPA 쿼리용 생성자 - 문자열 월 정보를 받는 생성자
     * 
     * @param month 년월 (yyyy-MM 형식)
     * @param department 부서명
     * @param questionCount 질문 개수
     * @param answerCount 답변 개수
     * @param pendingCount 답변 대기 개수
     */
    public QnaMonthlyStatisticsDto(String month, String department, long questionCount, long answerCount, long pendingCount) {
        this.month = month;
        this.department = department;
        this.questionCount = questionCount;
        this.answerCount = answerCount;
        this.pendingCount = pendingCount;
    }



    /**
     * 년월을 LocalDate로 변환
     * 
     * @return LocalDate (해당 월의 1일)
     */
    public LocalDate getMonthAsDate() {
        if (month == null || month.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(month + "-01");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 년월을 포맷된 문자열로 반환
     * 
     * @return 포맷된 년월 (예: "2025년 1월")
     */
    public String getFormattedMonth() {
        LocalDate date = getMonthAsDate();
        if (date == null) {
            return month;
        }
        return date.format(DateTimeFormatter.ofPattern("yyyy년 M월"));
    }

    /**
     * 답변률 계산
     * 
     * @return 답변률 (%)
     */
    public Double getAnswerRate() {
        if (questionCount == null || questionCount == 0) {
            return 0.0;
        }
        if (answerCount == null) {
            return 0.0;
        }
        return Math.round((answerCount.doubleValue() / questionCount.doubleValue()) * 100.0 * 100.0) / 100.0;
    }

    /**
     * 전체 처리 개수 (답변 + 대기)
     * 
     * @return 전체 처리 개수
     */
    public Long getTotalProcessedCount() {
        long answered = answerCount != null ? answerCount : 0;
        long pending = pendingCount != null ? pendingCount : 0;
        return answered + pending;
    }
}