package org.itcen.domain.qna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Q&A 답변 요청 DTO
 * 
 * Q&A 답변 등록 시 클라이언트로부터 받는 데이터를 담는 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 답변 요청 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaAnswerRequestDto {

    /**
     * 답변 내용
     */
    @NotBlank(message = "답변 내용은 필수입니다.")
    @Size(max = 5000, message = "답변 내용은 5000자 이하로 입력해주세요.")
    private String answerContent;

    /**
     * 유효성 검증 메서드
     * 
     * @return 유효성 검증 결과
     */
    public boolean isValid() {
        return answerContent != null && !answerContent.trim().isEmpty();
    }

    /**
     * 데이터 정제 메서드
     * 앞뒤 공백 제거
     */
    public void sanitize() {
        if (answerContent != null) {
            answerContent = answerContent.trim();
        }
    }
}