package org.itcen.domain.positions.dto;

import lombok.Data;
import java.util.List;

/**
 * 직책 일괄 삭제 요청 DTO
 * positionsId 목록을 받아 일괄 삭제를 요청한다.
 * SOLID 원칙: 단일 책임, 확장 가능
 */
@Data
public class PositionBulkDeleteRequestDto {
    private List<Long> positionsIds;
}
