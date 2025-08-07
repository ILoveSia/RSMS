package org.itcen.common.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.time.LocalDateTime;

/**
 * 기본 시간 엔티티
 * 모든 엔티티의 공통 시간 필드와 사용자 추적 필드를 관리합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 시간 관련 필드와 사용자 추적 필드만 관리
 * - Open/Closed: 확장에는 열려있고 수정에는 닫혀있음
 * - Liskov Substitution: 하위 클래스에서 안전하게 사용 가능
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {
    
    /**
     * 생성 시간
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 수정 시간
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
    
    // Getter/Setter
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedId() {
        return createdId;
    }

    public void setCreatedId(String createdId) {
        this.createdId = createdId;
    }

    public String getUpdatedId() {
        return updatedId;
    }

    public void setUpdatedId(String updatedId) {
        this.updatedId = updatedId;
    }
    
    /**
     * 엔티티 생성 전 처리
     * 생성일시, 수정일시, 생성자ID, 수정자ID를 설정합니다.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        String currentUserId = getCurrentUserId();
        
        createdAt = now;
        updatedAt = now;
        createdId = currentUserId;
        updatedId = currentUserId;
    }
    
    /**
     * 엔티티 수정 전 처리
     * 수정일시와 수정자ID를 갱신합니다.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updatedId = getCurrentUserId();
    }

    /**
     * 현재 인증된 사용자의 ID를 가져옵니다.
     * 세션에서 userId를 먼저 확인하고, 없으면 Security Context를 확인합니다.
     * 
     * @return 현재 사용자 ID 또는 "system"
     */
    private String getCurrentUserId() {
        try {
            // 1. 세션에서 userId 가져오기 (우선순위)
            ServletRequestAttributes requestAttributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (requestAttributes != null) {
                HttpServletRequest request = requestAttributes.getRequest();
                HttpSession session = request.getSession(false);
                if (session != null) {
                    String userId = (String) session.getAttribute("userId");
                    if (userId != null && !userId.trim().isEmpty()) {
                        return userId;
                    }
                }
            }
            
            // 2. SecurityContext에서 인증 정보 가져오기 (fallback)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            // 세션이나 SecurityContext에서 정보를 가져올 수 없는 경우
            // 로그를 남기고 system으로 처리
        }
        return "system";
    }
} 