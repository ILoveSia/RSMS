package org.itcen.domain.handover.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 인수인계 이력 관리 엔티티
 * 인수인계 과정에서 발생하는 모든 활동을 추적합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 이력 정보만 담당
 * - Open/Closed: 새로운 활동 유형 추가 시 확장 가능
 */
@Entity
@Table(name = "handover_histories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    /**
     * 인수인계 지정 ID (handover_assignments 테이블 FK)
     */
    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    /**
     * 활동 유형
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", length = 50, nullable = false)
    private ActivityType activityType;

    /**
     * 활동 설명
     */
    @Column(name = "activity_description", columnDefinition = "TEXT")
    private String activityDescription;

    /**
     * 활동 일시
     */
    @Column(name = "activity_date", nullable = false)
    @Builder.Default
    private LocalDateTime activityDate = LocalDateTime.now();

    /**
     * 작업자 사번
     */
    @Column(name = "actor_emp_no", length = 20)
    private String actorEmpNo;

    /**
     * 작업자 이름
     */
    @Column(name = "actor_name", length = 50)
    private String actorName;

    /**
     * 연관 엔티티 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "related_entity_type", length = 50)
    private RelatedEntityType relatedEntityType;

    /**
     * 연관 엔티티 ID
     */
    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 생성자 ID
     */
    @Column(name = "created_id", length = 100)
    private String createdId;

    /**
     * 활동 유형 열거형
     */
    public enum ActivityType {
        // 인수인계 지정 관련
        ASSIGNMENT_CREATED,     // 인수인계 지정 생성
        ASSIGNMENT_UPDATED,     // 인수인계 지정 수정
        ASSIGNMENT_STARTED,     // 인수인계 시작
        ASSIGNMENT_COMPLETED,   // 인수인계 완료

        // 문서 관련
        DOCUMENT_CREATED,       // 문서 생성
        DOCUMENT_UPDATED,       // 문서 수정
        DOCUMENT_APPROVED,      // 문서 승인
        DOCUMENT_PUBLISHED,     // 문서 발행

        // 메뉴얼 관련
        MANUAL_CREATED,         // 메뉴얼 생성
        MANUAL_UPDATED,         // 메뉴얼 수정
        MANUAL_APPROVED,        // 메뉴얼 승인
        MANUAL_PUBLISHED,       // 메뉴얼 발행
        DOCUMENT_SUBMITTED,     // 문서 제출
        DOCUMENT_REVERTED,      // 문서 되돌리기
        DOCUMENT_VERSION_UPDATED, // 문서 버전 업데이트

        // 점검 관련
        INSPECTION_PLANNED,     // 점검 계획
        INSPECTION_STARTED,     // 점검 시작
        INSPECTION_COMPLETED,   // 점검 완료

        // 파일 관련
        FILE_UPLOADED,          // 파일 업로드
        FILE_DOWNLOADED,        // 파일 다운로드

        // 기타
        COMMENT_ADDED,          // 댓글 추가
        STATUS_CHANGED          // 상태 변경
    }

    /**
     * 연관 엔티티 타입 열거형
     */
    public enum RelatedEntityType {
        HANDOVER_ASSIGNMENT,        // 인수인계 지정
        RESPONSIBILITY_DOCUMENT,    // 책무기술서
        INTERNAL_CONTROL_MANUAL,    // 내부통제 메뉴얼
        BUSINESS_PLAN_INSPECTION,   // 사업계획 점검
        ATTACHMENT                  // 첨부파일
    }

    /**
     * 정적 팩토리 메서드: 인수인계 지정 관련 이력 생성
     */
    public static HandoverHistory createAssignmentHistory(Long assignmentId, ActivityType activityType, 
                                                          String description, String actorEmpNo, String actorName) {
        return HandoverHistory.builder()
                .assignmentId(assignmentId)
                .activityType(activityType)
                .activityDescription(description)
                .actorEmpNo(actorEmpNo)
                .actorName(actorName)
                .relatedEntityType(RelatedEntityType.HANDOVER_ASSIGNMENT)
                .relatedEntityId(assignmentId)
                .build();
    }

    /**
     * 정적 팩토리 메서드: 문서 관련 이력 생성
     */
    public static HandoverHistory createDocumentHistory(Long assignmentId, ActivityType activityType, 
                                                        String description, String actorEmpNo, String actorName,
                                                        Long documentId) {
        return HandoverHistory.builder()
                .assignmentId(assignmentId)
                .activityType(activityType)
                .activityDescription(description)
                .actorEmpNo(actorEmpNo)
                .actorName(actorName)
                .relatedEntityType(RelatedEntityType.RESPONSIBILITY_DOCUMENT)
                .relatedEntityId(documentId)
                .build();
    }

    /**
     * 정적 팩토리 메서드: 메뉴얼 관련 이력 생성
     */
    public static HandoverHistory createManualHistory(Long assignmentId, ActivityType activityType, 
                                                      String description, String actorEmpNo, String actorName,
                                                      Long manualId) {
        return HandoverHistory.builder()
                .assignmentId(assignmentId)
                .activityType(activityType)
                .activityDescription(description)
                .actorEmpNo(actorEmpNo)
                .actorName(actorName)
                .relatedEntityType(RelatedEntityType.INTERNAL_CONTROL_MANUAL)
                .relatedEntityId(manualId)
                .build();
    }

    /**
     * 정적 팩토리 메서드: 점검 관련 이력 생성
     */
    public static HandoverHistory createInspectionHistory(Long assignmentId, ActivityType activityType, 
                                                          String description, String actorEmpNo, String actorName,
                                                          Long inspectionId) {
        return HandoverHistory.builder()
                .assignmentId(assignmentId)
                .activityType(activityType)
                .activityDescription(description)
                .actorEmpNo(actorEmpNo)
                .actorName(actorName)
                .relatedEntityType(RelatedEntityType.BUSINESS_PLAN_INSPECTION)
                .relatedEntityId(inspectionId)
                .build();
    }

    /**
     * 정적 팩토리 메서드: 파일 관련 이력 생성
     */
    public static HandoverHistory createFileHistory(Long assignmentId, ActivityType activityType, 
                                                    String description, String actorEmpNo, String actorName,
                                                    Long attachmentId) {
        return HandoverHistory.builder()
                .assignmentId(assignmentId)
                .activityType(activityType)
                .activityDescription(description)
                .actorEmpNo(actorEmpNo)
                .actorName(actorName)
                .relatedEntityType(RelatedEntityType.ATTACHMENT)
                .relatedEntityId(attachmentId)
                .build();
    }
}