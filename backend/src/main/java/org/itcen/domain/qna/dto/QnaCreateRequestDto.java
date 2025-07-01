package org.itcen.domain.qna.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.qna.entity.QnaPriority;

/**
 * Q&A 생성 요청 DTO
 * 
 * Q&A 생성 시 클라이언트로부터 받는 데이터를 담는 DTO입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 생성 요청 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QnaCreateRequestDto {

    /**
     * 담당업무/부서
     */
    @NotBlank(message = "담당업무는 필수입니다.")
    @Size(max = 100, message = "담당업무는 100자 이하로 입력해주세요.")
    private String department;

    /**
     * 제목
     */
    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 500, message = "제목은 500자 이하로 입력해주세요.")
    private String title;

    /**
     * 질문 내용
     */
    @Size(max = 5000, message = "질문 내용은 5000자 이하로 입력해주세요.")
    private String content;

    /**
     * 우선순위
     */
    @Builder.Default
    private QnaPriority priority = QnaPriority.NORMAL;

    /**
     * 카테고리
     */
    @Size(max = 50, message = "카테고리는 50자 이하로 입력해주세요.")
    private String category;

    /**
     * 공개여부
     */
    @NotNull(message = "공개여부는 필수입니다.")
    @Builder.Default
    private Boolean isPublic = true;

    /**
     * 유효성 검증 메서드
     * 
     * @return 유효성 검증 결과
     */
    public boolean isValid() {
        return department != null && !department.trim().isEmpty() &&
               title != null && !title.trim().isEmpty() &&
               isPublic != null;
    }

    /**
     * 데이터 정제 메서드
     * 앞뒤 공백 제거 및 null 체크
     */
    public void sanitize() {
        if (department != null) {
            department = department.trim();
        }
        if (title != null) {
            title = title.trim();
        }
        if (content != null) {
            content = content.trim();
        }
        if (category != null) {
            category = category.trim();
        }
        if (priority == null) {
            priority = QnaPriority.NORMAL;
        }
        if (isPublic == null) {
            isPublic = true;
        }
    }
}