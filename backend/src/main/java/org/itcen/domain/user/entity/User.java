package org.itcen.domain.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * 시스템 사용자 정보를 저장
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사용자 정보만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /**
     * 사용자 ID (Primary Key)
     */
    @Id
    @Column(length = 100)
    private String id;


    /**
     * 비밀번호 (암호화된 상태로 저장)
     */
    @Column(nullable = false, length = 255)
    private String password;


    // 직책코드(job_title_cd) 컬럼은 DB에서 제거됨. 엔티티에서도 제거하여 스키마에 맞춤

    /**
     * 사번 (employee number)
     */
    @Column(name = "emp_no", length = 100)
    private String empNo;

    /**
     * 생성일시
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 생성자 ID
     */
    @Column(name = "created_id", length = 100)
    private String createdId;

    /**
     * 수정자 ID
     */
    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 엔티티 생성 전 처리
     */
    @PrePersist
    protected void onCreate() {
        String currentUserId = getCurrentUserId();
        this.createdId = currentUserId;
        this.updatedId = currentUserId;
    }

    /**
     * 엔티티 수정 전 처리
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedId = getCurrentUserId();
    }

    /**
     * 현재 인증된 사용자의 ID를 가져옵니다.
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