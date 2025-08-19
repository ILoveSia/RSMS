package org.itcen.domain.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 메뉴 업데이트 응답 DTO
 * 메뉴 정보 수정 결과를 반환합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuUpdateResponseDto {
    
    /**
     * 업데이트된 메뉴 정보
     */
    private MenuDto menu;
    
    /**
     * 메뉴 순서 변경 여부
     */
    private boolean orderChanged;
    
    /**
     * 메뉴 정보 변경 여부
     */
    private boolean infoChanged;
    
    /**
     * 업데이트 성공 여부
     */
    private boolean success;
    
    /**
     * 에러 메시지 (실패 시)
     */
    private String errorMessage;
}
