package org.itcen.domain.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴와 부모 메뉴 정보를 함께 담는 DTO
 * 메뉴 관리 페이지에서 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuWithParentDto {

    private Long id;
    private String menuName;
    private String menuNameEn;
    private Long parentId;
    private String parentName;
    private Integer sortOrder;
    private String description;
}
