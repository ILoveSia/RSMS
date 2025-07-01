package org.itcen.domain.qna.entity;

/**
 * Q&A 우선순위 열거형
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 우선순위 값만 정의
 * - Open/Closed: 새로운 우선순위 추가 시 확장 가능
 */
public enum QnaPriority {
    /**
     * 높음
     */
    HIGH("높음", 3),
    
    /**
     * 보통
     */
    NORMAL("보통", 2),
    
    /**
     * 낮음
     */
    LOW("낮음", 1);
    
    private final String description;
    private final int level;
    
    QnaPriority(String description, int level) {
        this.description = description;
        this.level = level;
    }
    
    public String getDescription() {
        return description;
    }
    
    public int getLevel() {
        return level;
    }
    
    /**
     * 문자열로부터 QnaPriority를 찾는 메서드
     * 
     * @param priority 우선순위 문자열
     * @return QnaPriority 열거형 값
     * @throws IllegalArgumentException 유효하지 않은 우선순위일 경우
     */
    public static QnaPriority fromString(String priority) {
        for (QnaPriority qnaPriority : QnaPriority.values()) {
            if (qnaPriority.name().equalsIgnoreCase(priority)) {
                return qnaPriority;
            }
        }
        throw new IllegalArgumentException("유효하지 않은 Q&A 우선순위입니다: " + priority);
    }
}