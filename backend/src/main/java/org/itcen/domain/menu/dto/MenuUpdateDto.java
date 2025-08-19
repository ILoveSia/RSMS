package org.itcen.domain.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 업데이트 DTO
 * 메뉴 정보 수정 시 사용됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuUpdateDto {
    
    /**
     * 메뉴 ID
     */
    private Long id;
    
    /**
     * 메뉴명 (한국어)
     */
    private String menuName;
    
    /**
     * 메뉴명 (영어)
     */
    private String menuNameEn;
    
    /**
     * 메뉴 설명
     */
    private String description;
    
    /**
     * 부모 메뉴 ID (null이면 루트 메뉴)
     */
    private Long parentId;
    
    /**
     * 정렬 순서 (0이면 최상단, 그 외에는 선택된 메뉴의 sortOrder - 1)
     */
    private Integer sortOrder;
}
