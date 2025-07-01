package org.itcen.domain.qna.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Qna extends BaseEntity {

    /**
     * Q&A ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 담당업무/부서
     */
    @Column(nullable = false, length = 100)
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
     * 질문자 ID (PostgreSQL 테이블 구조에 맞춰 String으로 변경)
     */
    @Column(name = "questioner_id", nullable = false, length = 100)
    private String questionerId;

    /**
     * 질문자 이름 (비정규화 - 성능 최적화)
     */
    @Column(name = "questioner_name", nullable = false, length = 100)
    private String questionerName;

    /**
     * 답변 내용
     */
    @Column(name = "answer_content", columnDefinition = "TEXT")
    private String answerContent;

    /**
     * 답변자 ID (PostgreSQL 테이블 구조에 맞춰 String으로 변경)
     */
    @Column(name = "answerer_id", length = 100)
    private String answererId;

    /**
     * 답변자 이름 (비정규화 - 성능 최적화)
     */
    @Column(name = "answerer_name", length = 100)
    private String answererName;

    /**
     * Q&A 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private QnaStatus status = QnaStatus.PENDING;

    /**
     * 우선순위
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
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
     * 첨부파일 목록 (일대다 관계)
     */
    @OneToMany(mappedBy = "qna", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QnaAttachment> attachments = new ArrayList<>();

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
     * 첨부파일을 추가하는 메서드
     * 
     * @param attachment 첨부파일
     */
    public void addAttachment(QnaAttachment attachment) {
        this.attachments.add(attachment);
        attachment.setQna(this);
    }

    /**
     * 첨부파일을 제거하는 메서드
     * 
     * @param attachment 첨부파일
     */
    public void removeAttachment(QnaAttachment attachment) {
        this.attachments.remove(attachment);
        attachment.setQna(null);
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