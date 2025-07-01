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
     * 사용자명 (로그인 ID)
     */
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    /**
     * 이메일
     */
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    /**
     * 주소
     */
    @Column(nullable = false, length = 255)
    private String address;

    /**
     * 휴대폰 번호
     */
    @Column(nullable = false, length = 20)
    private String mobile;

    /**
     * 비밀번호 (암호화된 상태로 저장)
     */
    @Column(nullable = false, length = 255)
    private String password;

    /**
     * 부서코드
     */
    @Column(name = "dept_cd", length = 100)
    private String deptCd;

    /**
     * 사번
     */
    @Column(name = "num", length = 100)
    private String num;

    /**
     * 직급코드
     */
    @Column(name = "job_rank_cd", length = 100)
    private String jobRankCd;

    /**
     * 직책코드
     */
    @Column(name = "job_title_cd", length = 100)
    private String jobTitleCd;

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