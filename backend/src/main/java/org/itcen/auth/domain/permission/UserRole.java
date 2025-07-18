package org.itcen.auth.domain.permission;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자-역할 매핑 엔티티
 *
 * SOLID 원칙: - 단일 책임: 사용자와 역할의 매핑 관계만 담당 - 개방-폐쇄: 새로운 매핑 조건 추가 시 확장 가능 - 리스코프 치환: 기본적인 매핑 동작 지원 -
 * 인터페이스 분리: 필요한 기능만 노출 - 의존성 역전: 구현체가 아닌 추상화에 의존
 */
@Entity(name = "UserRole")
@Table(name = "user_roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserRoleId.class)
public class UserRole {

    /**
     * 사용자 ID (복합키)
     */
    @Id
    @Column(name = "user_id", length = 50)
    private String userId;

    /**
     * 역할 ID (복합키)
     */
    @Id
    @Column(name = "role_id", length = 20)
    private String roleId;

    /**
     * 역할 할당 일시
     */
    @Builder.Default
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    /**
     * 역할 할당자
     */
    @Builder.Default
    @Column(name = "assigned_by", length = 50)
    private String assignedBy = "system";

    /**
     * 사용 여부
     */
    @Builder.Default
    @Column(name = "use_yn", nullable = false, length = 1)
    private String useYn = "Y";

    /**
     * 역할 엔티티 (다대일 관계)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    /**
     * 역할 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }

    /**
     * 역할 비활성화
     */
    public void deactivate() {
        this.useYn = "N";
    }

    /**
     * 활성 상태 확인
     */
    public boolean isActive() {
        return "Y".equals(this.useYn);
    }

    /**
     * 사용자-역할 매핑 생성을 위한 정적 팩토리 메서드
     */
    public static UserRole createMapping(String userId, String roleId, String assignedBy) {
        return UserRole.builder().userId(userId).roleId(roleId).assignedAt(LocalDateTime.now())
                .assignedBy(assignedBy).useYn("Y").build();
    }

    /**
     * 사용자-역할 매핑 생성 (시스템에 의한)
     */
    public static UserRole createMapping(String userId, String roleId) {
        return createMapping(userId, roleId, "system");
    }
}
