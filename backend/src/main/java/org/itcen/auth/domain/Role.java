package org.itcen.auth.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseEntity;

/**
 * 사용자 권한 엔티티
 * 
 * 단일 책임 원칙: 사용자 권한 정보만을 담당
 * 개방-폐쇄 원칙: 새로운 권한 타입 추가 시 확장 가능
 */
@Entity
@Table(name = "roles")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity {
    
    /**
     * 권한 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 권한명 (ROLE_USER, ROLE_ADMIN 등)
     * ROLE_ 접두사를 포함하여 저장
     */
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    /**
     * 권한 설명
     */
    @Column(length = 255)
    private String description;
    
    /**
     * 권한 활성화 여부
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;
    
    /**
     * 기본 권한 생성을 위한 정적 팩토리 메서드
     * 
     * @param roleName 권한명 (ROLE_ 접두사 없이)
     * @return Role 엔티티
     */
    public static Role createUserRole(String roleName) {
        return Role.builder()
                .name("ROLE_" + roleName.toUpperCase())
                .description(roleName + " 권한")
                .enabled(true)
                .build();
    }
    
    /**
     * 권한명에서 ROLE_ 접두사를 제거한 순수 권한명 반환
     * 
     * @return 순수 권한명
     */
    public String getAuthority() {
        return this.name.startsWith("ROLE_") ? this.name.substring(5) : this.name;
    }
} 