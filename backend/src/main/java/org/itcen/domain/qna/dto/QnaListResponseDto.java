package org.itcen.domain.qna.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.qna.entity.Qna;
import org.itcen.domain.qna.entity.QnaPriority;
import org.itcen.domain.qna.entity.QnaStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Q&A 목록 조회 응답 DTO
 *
 * Q&A 목록 화면에서 필요한 정보만 포함하여 성능을 최적화합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: Q&A 목록 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaListResponseDto {

    /**
     * Q&A ID
     */
    private Long id;

     /**
      * 담당업무/부서 (스키마 변경으로 임시 제거)
      */
     private String department;

    /**
     * 제목
     */
    private String title;

     /**
      * 질문자 이름 (DB 컬럼 없음)
      */
     private String questionerName;

     /**
      * 답변자 이름 (DB 컬럼 없음)
      */
     private String answererName;

    /**
     * 상태
     */
    private QnaStatus status;

    /**
     * 상태 설명
     */
    private String statusDescription;

    /**
     * 우선순위
     */
    private QnaPriority priority;

    /**
     * 우선순위 설명
     */
    private String priorityDescription;

    /**
     * 카테고리
     */
    private String category;

    /**
     * 공개여부
     */
    private Boolean isPublic;

    /**
     * 조회수
     */
    private Integer viewCount;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 생성일시 (포맷된 문자열)
     */
    private String createdAtFormatted;

    /**
     * 답변일시
     */
    private LocalDateTime answeredAt;

    /**
     * 답변일시 (포맷된 문자열)
     */
    private String answeredAtFormatted;

    /**
     * Entity로부터 DTO를 생성하는 정적 팩토리 메서드
     *
     * @param qna Q&A 엔티티
     * @return QnaListResponseDto
     */
    public static QnaListResponseDto from(Qna qna) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd");

        return QnaListResponseDto.builder()
                .id(qna.getId())
                 .department(qna.getDepartment())
                .title(qna.getTitle())
                 .questionerName(qna.getQuestionerName())
                 .answererName(qna.getAnswererName())
                .status(qna.getStatus())
                .statusDescription(qna.getStatus().getDescription())
                .priority(qna.getPriority())
                .priorityDescription(qna.getPriority() != null ? qna.getPriority().getDescription() : "")
                .category(qna.getCategory())
                .isPublic(qna.getIsPublic())
                .viewCount(qna.getViewCount())
                .createdAt(qna.getCreatedAt())
                .createdAtFormatted(qna.getCreatedAt() != null ? qna.getCreatedAt().format(formatter) : "")
                .answeredAt(qna.getAnsweredAt())
                .answeredAtFormatted(qna.getAnsweredAt() != null ? qna.getAnsweredAt().format(formatter) : "")
                .build();
    }

    /**
     * 답변 완료 여부를 확인하는 메서드
     *
     * @return 답변 완료 여부
     */
    public boolean isAnswered() {
        return status == QnaStatus.ANSWERED;
    }

    /**
     * 답변 대기 여부를 확인하는 메서드
     *
     * @return 답변 대기 여부
     */
    public boolean isPending() {
        return status == QnaStatus.PENDING;
    }

    /**
     * 높은 우선순위 여부를 확인하는 메서드
     *
     * @return 높은 우선순위 여부
     */
    public boolean isHighPriority() {
        return priority == QnaPriority.HIGH;
    }
}
