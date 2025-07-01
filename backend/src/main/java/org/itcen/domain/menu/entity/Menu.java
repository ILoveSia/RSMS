package org.itcen.domain.menu.entity;

import jakarta.persistence.*;
import org.itcen.common.entity.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

/**
 * 메뉴 엔티티
 * 계층형 메뉴 구조를 지원하는 메뉴 정보를 관리합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 정보만 관리
 * - Open/Closed: 새로운 메뉴 속성 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity 상속으로 일관성 유지
 * - Interface Segregation: 필요한 메서드만 노출
 * - Dependency Inversion: 인터페이스 기반 설계
 */
@Entity
@Table(name = "menus", indexes = {
    @Index(name = "idx_menus_parent_id", columnList = "parent_id"),
    @Index(name = "idx_menus_menu_code", columnList = "menu_code"),
    @Index(name = "idx_menus_sort_order", columnList = "sort_order")
})
public class Menu extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 메뉴 코드 (고유 식별자)
     * 예: LEDGER_MGMT, LEDGER_INQUIRY 등
     */
    @Column(name = "menu_code", unique = true, nullable = false, length = 50)
    private String menuCode;
    
    /**
     * 메뉴명 (한국어)
     */
    @Column(name = "menu_name", nullable = false, length = 100)
    private String menuName;
    
    /**
     * 메뉴명 (영어)
     */
    @Column(name = "menu_name_en", length = 100)
    private String menuNameEn;
    
    /**
     * 부모 메뉴 (자기 참조)
     * 최상위 메뉴의 경우 null
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Menu parent;
    
    /**
     * 하위 메뉴 목록
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Menu> children = new ArrayList<>();
    
    /**
     * 메뉴 레벨 (1: 최상위, 2: 2차 메뉴, ...)
     */
    @Column(name = "menu_level", nullable = false)
    private Integer menuLevel = 1;
    
    /**
     * 정렬 순서
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
    
    /**
     * 메뉴 URL
     */
    @Column(name = "menu_url", length = 200)
    private String menuUrl;
    
    /**
     * 아이콘 클래스 (Font Awesome 등)
     */
    @Column(name = "icon_class", length = 50)
    private String iconClass;
    
    /**
     * 활성화 여부
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    /**
     * 표시 여부
     */
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;
    
    /**
     * 메뉴 설명
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 메뉴 권한 목록
     */
    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuPermission> permissions = new ArrayList<>();
    
    // 기본 생성자
    protected Menu() {}
    
    // 생성자
    public Menu(String menuCode, String menuName, String menuNameEn, Menu parent, 
                Integer menuLevel, Integer sortOrder, String menuUrl, String iconClass, String description) {
        this.menuCode = menuCode;
        this.menuName = menuName;
        this.menuNameEn = menuNameEn;
        this.parent = parent;
        this.menuLevel = menuLevel;
        this.sortOrder = sortOrder;
        this.menuUrl = menuUrl;
        this.iconClass = iconClass;
        this.description = description;
        this.isActive = true;
        this.isVisible = true;
    }
    
    // 비즈니스 메서드
    
    /**
     * 하위 메뉴 추가
     */
    public void addChild(Menu child) {
        children.add(child);
        child.setParent(this);
        child.setMenuLevel(this.menuLevel + 1);
    }
    
    /**
     * 하위 메뉴 제거
     */
    public void removeChild(Menu child) {
        children.remove(child);
        child.setParent(null);
    }
    
    /**
     * 최상위 메뉴인지 확인
     */
    public boolean isRootMenu() {
        return parent == null;
    }
    
    /**
     * 하위 메뉴가 있는지 확인
     */
    public boolean hasChildren() {
        return !children.isEmpty();
    }
    
    /**
     * 메뉴 활성화
     */
    public void activate() {
        this.isActive = true;
    }
    
    /**
     * 메뉴 비활성화
     */
    public void deactivate() {
        this.isActive = false;
    }
    
    /**
     * 메뉴 표시
     */
    public void show() {
        this.isVisible = true;
    }
    
    /**
     * 메뉴 숨김
     */
    public void hide() {
        this.isVisible = false;
    }
    
    /**
     * 메뉴 정보 업데이트
     */
    public void updateMenuInfo(String menuName, String menuNameEn, String menuUrl, 
                              String iconClass, String description) {
        this.menuName = menuName;
        this.menuNameEn = menuNameEn;
        this.menuUrl = menuUrl;
        this.iconClass = iconClass;
        this.description = description;
    }
    
    /**
     * 정렬 순서 변경
     */
    public void changeSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    // Getter/Setter
    public Long getId() {
        return id;
    }
    
    public String getMenuCode() {
        return menuCode;
    }
    
    public void setMenuCode(String menuCode) {
        this.menuCode = menuCode;
    }
    
    public String getMenuName() {
        return menuName;
    }
    
    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }
    
    public String getMenuNameEn() {
        return menuNameEn;
    }
    
    public void setMenuNameEn(String menuNameEn) {
        this.menuNameEn = menuNameEn;
    }
    
    public Menu getParent() {
        return parent;
    }
    
    public void setParent(Menu parent) {
        this.parent = parent;
    }
    
    public List<Menu> getChildren() {
        return children;
    }
    
    public void setChildren(List<Menu> children) {
        this.children = children;
    }
    
    public Integer getMenuLevel() {
        return menuLevel;
    }
    
    public void setMenuLevel(Integer menuLevel) {
        this.menuLevel = menuLevel;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public String getMenuUrl() {
        return menuUrl;
    }
    
    public void setMenuUrl(String menuUrl) {
        this.menuUrl = menuUrl;
    }
    
    public String getIconClass() {
        return iconClass;
    }
    
    public void setIconClass(String iconClass) {
        this.iconClass = iconClass;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getIsVisible() {
        return isVisible;
    }
    
    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<MenuPermission> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(List<MenuPermission> permissions) {
        this.permissions = permissions;
    }
    
    @Override
    public String toString() {
        return "Menu{" +
                "id=" + id +
                ", menuCode='" + menuCode + '\'' +
                ", menuName='" + menuName + '\'' +
                ", menuLevel=" + menuLevel +
                ", sortOrder=" + sortOrder +
                ", isActive=" + isActive +
                '}';
    }
} 