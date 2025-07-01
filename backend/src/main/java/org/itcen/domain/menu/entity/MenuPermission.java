package org.itcen.domain.menu.entity;

import jakarta.persistence.*;
import org.itcen.common.entity.BaseTimeEntity;

/**
 * 메뉴 권한 엔티티
 * 메뉴별 역할 기반 권한을 관리합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 권한 정보만 관리
 * - Open/Closed: 새로운 권한 타입 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity 상속으로 일관성 유지
 * - Interface Segregation: 필요한 메서드만 노출
 * - Dependency Inversion: 인터페이스 기반 설계
 */
@Entity
@Table(name = "menu_permissions", 
       uniqueConstraints = @UniqueConstraint(name = "uk_menu_permission", columnNames = {"menu_id", "role_name"}))
public class MenuPermission extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 메뉴 참조
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;
    
    /**
     * 역할명
     * 예: ADMIN, USER, MANAGER 등
     */
    @Column(name = "role_name", nullable = false, length = 50)
    private String roleName;
    
    /**
     * 읽기 권한
     */
    @Column(name = "can_read", nullable = false)
    private Boolean canRead = false;
    
    /**
     * 쓰기 권한
     */
    @Column(name = "can_write", nullable = false)
    private Boolean canWrite = false;
    
    /**
     * 삭제 권한
     */
    @Column(name = "can_delete", nullable = false)
    private Boolean canDelete = false;
    
    // 기본 생성자
    protected MenuPermission() {}
    
    // 생성자
    public MenuPermission(Menu menu, String roleName, Boolean canRead, Boolean canWrite, Boolean canDelete) {
        this.menu = menu;
        this.roleName = roleName;
        this.canRead = canRead;
        this.canWrite = canWrite;
        this.canDelete = canDelete;
    }
    
    // 비즈니스 메서드
    
    /**
     * 읽기 권한 부여
     */
    public void grantReadPermission() {
        this.canRead = true;
    }
    
    /**
     * 읽기 권한 제거
     */
    public void revokeReadPermission() {
        this.canRead = false;
    }
    
    /**
     * 쓰기 권한 부여
     */
    public void grantWritePermission() {
        this.canWrite = true;
    }
    
    /**
     * 쓰기 권한 제거
     */
    public void revokeWritePermission() {
        this.canWrite = false;
    }
    
    /**
     * 삭제 권한 부여
     */
    public void grantDeletePermission() {
        this.canDelete = true;
    }
    
    /**
     * 삭제 권한 제거
     */
    public void revokeDeletePermission() {
        this.canDelete = false;
    }
    
    /**
     * 모든 권한 부여
     */
    public void grantAllPermissions() {
        this.canRead = true;
        this.canWrite = true;
        this.canDelete = true;
    }
    
    /**
     * 모든 권한 제거
     */
    public void revokeAllPermissions() {
        this.canRead = false;
        this.canWrite = false;
        this.canDelete = false;
    }
    
    /**
     * 읽기 전용 권한 설정
     */
    public void setReadOnlyPermission() {
        this.canRead = true;
        this.canWrite = false;
        this.canDelete = false;
    }
    
    /**
     * 권한이 있는지 확인
     */
    public boolean hasAnyPermission() {
        return canRead || canWrite || canDelete;
    }
    
    /**
     * 특정 권한이 있는지 확인
     */
    public boolean hasPermission(String permissionType) {
        return switch (permissionType.toLowerCase()) {
            case "read" -> canRead;
            case "write" -> canWrite;
            case "delete" -> canDelete;
            default -> false;
        };
    }
    
    // Getter/Setter
    public Long getId() {
        return id;
    }
    
    public Menu getMenu() {
        return menu;
    }
    
    public void setMenu(Menu menu) {
        this.menu = menu;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public Boolean getCanRead() {
        return canRead;
    }
    
    public void setCanRead(Boolean canRead) {
        this.canRead = canRead;
    }
    
    public Boolean getCanWrite() {
        return canWrite;
    }
    
    public void setCanWrite(Boolean canWrite) {
        this.canWrite = canWrite;
    }
    
    public Boolean getCanDelete() {
        return canDelete;
    }
    
    public void setCanDelete(Boolean canDelete) {
        this.canDelete = canDelete;
    }
    
    @Override
    public String toString() {
        return "MenuPermission{" +
                "id=" + id +
                ", roleName='" + roleName + '\'' +
                ", canRead=" + canRead +
                ", canWrite=" + canWrite +
                ", canDelete=" + canDelete +
                '}';
    }
} 