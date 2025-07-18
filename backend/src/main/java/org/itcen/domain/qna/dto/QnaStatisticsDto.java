package org.itcen.domain.qna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Q&A 통계 DTO
 * 
 * Q&A 통계 정보를 전송하기 위한 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 통계 데이터 전송만 담당
 * - Open/Closed: 새로운 통계 필드 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaStatisticsDto {

    /**
     * 부서명
     */
    private String department;

    /**
     * 전체 Q&A 개수
     */
    private Long totalCount;

    /**
     * 답변 대기 중인 Q&A 개수
     */
    private Long pendingCount;

    /**
     * 답변 완료된 Q&A 개수
     */
    private Long answeredCount;

    /**
     * 종료된 Q&A 개수
     */
    private Long closedCount;

    /**
     * 답변률 (%)
     */
    private Double answerRate;

    /**
     * 평균 응답 시간 (시간)
     */
    private Double avgResponseHours;

    public QnaStatisticsDto(String department, long totalCount, long pendingCount, long answeredCount, long closedCount) {
        this.department = department;
        this.totalCount = totalCount;
        this.pendingCount = pendingCount;
        this.answeredCount = answeredCount;
        this.closedCount = closedCount;
    }

    /**
     * 답변률 계산 메서드
     * 
     * @return 답변률 (%)
     */
    public Double calculateAnswerRate() {
        if (totalCount == null || totalCount == 0) {
            return 0.0;
        }
        if (answeredCount == null) {
            return 0.0;
        }
        return Math.round((answeredCount.doubleValue() / totalCount.doubleValue()) * 100.0 * 100.0) / 100.0;
    }

    /**
     * 평균 응답 시간을 일/시간/분 형태로 포맷팅
     * 
     * @return 포맷된 응답 시간
     */
    public String getFormattedAvgResponseTime() {
        if (avgResponseHours == null || avgResponseHours == 0) {
            return "0시간";
        }
        
        double hours = avgResponseHours;
        int days = (int) (hours / 24);
        int remainingHours = (int) (hours % 24);
        int minutes = (int) ((hours % 1) * 60);
        
        StringBuilder sb = new StringBuilder();
        if (days > 0) {
            sb.append(days).append("일 ");
        }
        if (remainingHours > 0) {
            sb.append(remainingHours).append("시간 ");
        }
        if (minutes > 0) {
            sb.append(minutes).append("분");
        }
        
        return sb.toString().trim();
    }
}