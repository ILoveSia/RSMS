package org.itcen.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

/**
 * 기본 엔티티 클래스
 * 
 * 모든 엔티티가 상속받아야 하는 기본 클래스로,
 * 생성일시, 수정일시, 생성자ID, 수정자ID를 자동으로 관리합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 엔티티의 공통 속성 관리만 담당
 * - Open/Closed: 확장에는 열려있고 수정에는 닫혀있음
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    /**
     * 생성일시
     * 엔티티가 처음 저장될 때 자동으로 설정됩니다.
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정일시
     * 엔티티가 업데이트될 때마다 자동으로 갱신됩니다.
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 생성자 ID
     * 엔티티를 생성한 사용자의 ID입니다.
     */
    @Column(name = "created_id", length = 100, updatable = false)
    private String createdId;

    /**
     * 수정자 ID
     * 엔티티를 마지막으로 수정한 사용자의 ID입니다.
     */
    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 생성자 ID 수동 설정
     */
    public void setCreatedId(String createdId) {
        this.createdId = createdId;
    }

    /**
     * 수정자 ID 수동 설정
     */
    public void setUpdatedId(String updatedId) {
        this.updatedId = updatedId;
    }

    /**
     * 엔티티가 저장되기 전에 호출되는 메서드
     * 생성일시, 수정일시, 생성자ID, 수정자ID를 설정합니다.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        String currentUserId = getCurrentUserId();
        
        this.createdAt = now;
        this.updatedAt = now;
        this.createdId = currentUserId;
        this.updatedId = currentUserId;
    }

    /**
     * 엔티티가 업데이트되기 전에 호출되는 메서드
     * 수정일시와 수정자ID를 갱신합니다.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.updatedId = getCurrentUserId();
    }

    /**
     * 현재 인증된 사용자의 ID를 가져옵니다.
     * 인증되지 않은 경우 "system"을 반환합니다.
     * 
     * @return 현재 사용자 ID 또는 "system"
     */
    private String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // SecurityContext에서 인증 정보를 가져올 수 없는 경우
        }
        return "system";
    }
} 