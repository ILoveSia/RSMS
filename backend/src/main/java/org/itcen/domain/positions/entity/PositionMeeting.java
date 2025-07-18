package org.itcen.domain.positions.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;
import org.itcen.domain.meeting.entity.MeetingBody;

/**
 * 직책 회의체 엔티티
 * 
 * 직책별 참여 회의체 정보를 저장하는 엔티티입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책-회의체 관계 데이터 저장만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 상속
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "positions_meeting")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionMeeting extends BaseTimeEntity {

    /**
     * 직책 회의체 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "positions_meeting_id", nullable = false)
    private Long positionsMeetingId;

    /**
     * 원본 직책등록ID
     */
    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    /**
     * 회의체 ID
     */
    @Column(name = "meeting_body_id", length = 100)
    private String meetingBodyId;

    /**
     * 직책과의 연관관계 (옵션)
     * 필요 시 fetch join 등에 활용 가능
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "positions_id", referencedColumnName = "positions_id", insertable = false, updatable = false)
    private Position position;

    /**
     * 회의체와의 연관관계 (옵션)
     * 필요 시 fetch join 등에 활용 가능
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_body_id", referencedColumnName = "meeting_body_id", insertable = false, updatable = false)
    private MeetingBody meetingBody;
} 