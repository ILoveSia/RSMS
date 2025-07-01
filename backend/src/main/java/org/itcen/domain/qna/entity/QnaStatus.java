package org.itcen.domain.qna.entity;

/**
 * Q&A 상태 열거형
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 상태 값만 정의
 * - Open/Closed: 새로운 상태 추가 시 확장 가능
 */
public enum QnaStatus {
    /**
     * 답변 대기 중
     */
    PENDING("답변대기"),
    
    /**
     * 답변 완료
     */
    ANSWERED("답변완료"),
    
    /**
     * 종료됨
     */
    CLOSED("종료");
    
    private final String description;
    
    QnaStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 문자열로부터 QnaStatus를 찾는 메서드
     * 
     * @param status 상태 문자열
     * @return QnaStatus 열거형 값
     * @throws IllegalArgumentException 유효하지 않은 상태일 경우
     */
    public static QnaStatus fromString(String status) {
        for (QnaStatus qnaStatus : QnaStatus.values()) {
            if (qnaStatus.name().equalsIgnoreCase(status)) {
                return qnaStatus;
            }
        }
        throw new IllegalArgumentException("유효하지 않은 Q&A 상태입니다: " + status);
    }
}