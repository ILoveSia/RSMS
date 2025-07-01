package org.itcen.domain.common.entity;

import org.itcen.common.entity.BaseTimeEntity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.Serializable;
import java.util.Objects;

/**
 * 공통코드 엔티티
 * 
 * 시스템 전반에서 사용되는 공통코드를 관리하는 엔티티입니다.
 * 그룹코드와 코드의 복합키를 사용하여 계층적 코드 구조를 지원합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 공통코드 데이터만을 담당
 * - Immutable Entity: 생성 후 수정을 제한하여 데이터 일관성 보장
 */
@Entity
@Table(name = "common_code")
@IdClass(CommonCodeId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Builder
public class CommonCode {
    @Id
    @Column(name = "group_code", length = 50, nullable = false)
    private String groupCode;

    @Id
    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @Column(name = "code_name", length = 100, nullable = false)
    private String codeName;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "use_yn", length = 1, nullable = false)
    private String useYn = "Y";

    /**
     * 코드를 활성화합니다. (useYn = "Y")
     * 이 메소드는 객체의 상태를 변경하는 명확한 행위를 나타내며,
     * 단순 setter(setUseYn)를 직접 사용하는 것보다 코드의 가독성과 의도를 높여줍니다.
     */
    public void activate() {
        this.useYn = "Y";
    }

    /**
     * 코드를 비활성화합니다. (useYn = "N")
     * 이 메소드는 객체의 상태를 변경하는 명확한 행위를 나타내며,
     * 단순 setter(setUseYn)를 직접 사용하는 것보다 코드의 가독성과 의도를 높여줍니다.
     */
    public void deactivate() {
        this.useYn = "N";
    }

    /**
     * 사용여부(Y/N) 변경 Setter (SOLID 원칙: 최소한의 변경만 허용)
     * @deprecated activate() 또는 deactivate() 메소드 사용을 권장합니다.
     */
    @Deprecated
    public void setUseYn(String useYn) {
        this.useYn = useYn;
    }

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private java.time.LocalDateTime updatedAt;

    @Column(name = "created_id", length = 100)
    private String createdId;

    @Column(name = "updated_id", length = 100)
    private String updatedId;

    /**
     * 엔티티 생성 전 처리
     */
    @PrePersist
    protected void onCreate() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        String currentUserId = getCurrentUserId();
        
        this.createdAt = now;
        this.updatedAt = now;
        this.createdId = currentUserId;
        this.updatedId = currentUserId;
    }

    /**
     * 엔티티 수정 전 처리
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = java.time.LocalDateTime.now();
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
