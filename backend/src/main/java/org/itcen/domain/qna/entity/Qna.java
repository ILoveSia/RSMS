package org.itcen.domain.qna.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.itcen.common.entity.BaseEntity;

import java.time.LocalDateTime;

/**
 * Q&A 엔티티
 *
 * 질문과 답변 정보를 관리하는 엔티티입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: Q&A 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseEntity를 안전하게 대체 가능
 * - Interface Segregation: 필요한 인터페이스만 의존
 * - Dependency Inversion: 구체 클래스가 아닌 추상화에 의존
 */
@Entity
@Table(name = "qna")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Qna extends BaseEntity {

    /**
     * Q&A ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 담당업무/부서 (DB 컬럼 제거됨) - 애플리케이션 호환을 위한 임시 필드
     */
    @Transient
    private String department;

    /**
     * 제목/질문내용
     */
    @Column(nullable = false, length = 500)
    private String title;

    /**
     * 상세 질문 내용
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * 질문자 사번 (DB: questioner_emp_no)
     */
    @Column(name = "questioner_emp_no", nullable = false, length = 100)
    private String questionerId;

    /**
     * 질문자 이름 (DB 컬럼 없음) - 애플리케이션 호환을 위한 임시 필드
     */
    @Transient
    private String questionerName;

    /**
     * 답변 내용
     */
    @Column(name = "answer_content", columnDefinition = "TEXT")
    private String answerContent;

    /**
     * 답변자 사번 (DB: answerer_emp_no)
     */
    @Column(name = "answerer_emp_no", length = 100)
    private String answererId;

    /**
     * 답변자 이름 (DB 컬럼 없음) - 애플리케이션 호환을 위한 임시 필드
     */
    @Transient
    private String answererName;

    /**
     * Q&A 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private QnaStatus status = QnaStatus.PENDING;

    /**
     * 우선순위 (DB 컬럼 제거됨) - 애플리케이션 호환을 위한 임시 필드
     */
    @Transient
    @Builder.Default
    private QnaPriority priority = QnaPriority.NORMAL;

    /**
     * 카테고리
     */
    @Column(length = 50)
    private String category;

    /**
     * 공개여부
     */
    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = true;

    /**
     * 조회수
     */
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    /**
     * 답변일시
     */
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    /**
     * 답변을 등록하는 메서드
     *
     * @param answererId 답변자 ID
     * @param answererName 답변자 이름
     * @param answerContent 답변 내용
     */
    public void addAnswer(String answererId, String answererName, String answerContent) {
        this.answererId = answererId;
        this.answererName = answererName;
        this.answerContent = answerContent;
        this.status = QnaStatus.ANSWERED;
        this.answeredAt = LocalDateTime.now();
    }

    /**
     * Q&A를 종료하는 메서드
     */
    public void close() {
        this.status = QnaStatus.CLOSED;
    }

    /**
     * 조회수를 증가시키는 메서드
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 답변 완료 여부를 확인하는 메서드
     *
     * @return 답변 완료 여부
     */
    public boolean isAnswered() {
        return this.status == QnaStatus.ANSWERED;
    }

    /**
     * Q&A 종료 여부를 확인하는 메서드
     *
     * @return Q&A 종료 여부
     */
    public boolean isClosed() {
        return this.status == QnaStatus.CLOSED;
    }

    /**
     * Q&A 대기 상태 여부를 확인하는 메서드
     *
     * @return Q&A 대기 상태 여부
     */
    public boolean isPending() {
        return this.status == QnaStatus.PENDING;
    }
}
