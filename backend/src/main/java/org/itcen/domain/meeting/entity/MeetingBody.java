package org.itcen.domain.meeting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

/**
 * 회의체 엔티티
 * 
 * 회의체 정보를 저장하는 엔티티입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 회의체 데이터 저장만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 상속
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "meeting_body")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingBody extends BaseTimeEntity {

    /**
     * 회의체 ID (Primary Key)
     * 서비스 레이어에서 수동 할당
     */
    @Id
    @Column(name = "meeting_body_id", nullable = false, length = 100)
    private String meetingBodyId;

    /**
     * 구분 (등록, 동목 등)
     */
    @Column(name = "gubun", nullable = false, length = 100)
    private String gubun;

    /**
     * 회의체명
     */
    @Column(name = "meeting_name", nullable = false, length = 500)
    private String meetingName;

    /**
     * 개최주기 (반기별, 분기별, 필요시 등)
     */
    @Column(name = "meeting_period", nullable = false, length = 10)
    private String meetingPeriod;

    /**
     * 주요 심의·의결사항 (내용)
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
}