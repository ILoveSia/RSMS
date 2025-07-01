package org.itcen.domain.positions.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 직책 히스토리 엔티티
 * 
 * 직책 정보의 변경 이력을 저장하는 엔티티입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 변경 이력 데이터 저장만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: 일관된 데이터 모델 구조 유지
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "positions_hist")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionHist {

    /**
     * 히스토리 일련번호 (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "positions_hist_seq")
    @SequenceGenerator(name = "positions_hist_seq", sequenceName = "positions_hist_seq", allocationSize = 1)
    @Column(name = "history_seq", nullable = false)
    private Long historySeq;

    /**
     * 히스토리ID (기록시점)
     */
    @Column(name = "history_id", nullable = false)
    private LocalDateTime historyId;

    /**
     * 원본 직책등록ID
     */
    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    /**
     * 원장차수
     */
    @Column(name = "ledger_order", length = 100)
    private String ledgerOrder;

    /**
     * 직책명
     */
    @Column(name = "positions_nm", length = 200)
    private String positionsNm;

    /**
     * 확정구분코드
     */
    @Column(name = "confirm_gubun_cd", length = 10)
    private String confirmGubunCd;

    /**
     * 책무기술서 작성 부서코드
     */
    @Column(name = "write_dept_cd", length = 10)
    private String writeDeptCd;

    /**
     * 원본 데이터 생성일시
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 원본 데이터 수정일시
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 원본 데이터 생성자 ID
     */
    @Column(name = "created_id", length = 100)
    private String createdId;

    /**
     * 원본 데이터 수정자 ID
     */
    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 히스토리 구분 (C: 생성, U: 수정, D: 삭제)
     */
    @Column(name = "history_gubun", length = 1)
    private String historyGubun;

    /**
     * 히스토리 생성 전 처리
     */
    @PrePersist
    protected void onHistoryCreate() {
        if (historyId == null) {
            historyId = LocalDateTime.now();
        }
    }
} 