package org.itcen.domain.responsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.itcen.domain.responsibility.entity.ResponsibilityDetail;

/**
 * 책무상세 선택용 DTO
 * 
 * 프론트엔드의 책무상세 선택 팝업에서 사용되는 데이터 형식입니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponsibilityDetailSelectDto {

    /**
     * 책무상세 ID
     */
    private Long responsibilityDetailId;

    /**
     * 책무상세 내용
     */
    private String responsibilityDetailContent;

    /**
     * 책무관련근거
     */
    private String responsibilityRelEvid;

    /**
     * Entity에서 DTO로 변환
     */
    public static ResponsibilityDetailSelectDto from(ResponsibilityDetail entity) {
        return ResponsibilityDetailSelectDto.builder()
                .responsibilityDetailId(entity.getResponsibilityDetailId())
                .responsibilityDetailContent(entity.getResponsibilityDetailContent())
                .responsibilityRelEvid(entity.getResponsibilityRelEvid())
                .build();
    }
}