package org.itcen.domain.menu.dto;

import org.itcen.domain.menu.entity.Menu;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 메뉴 DTO
 * 메뉴 정보를 전송하기 위한 데이터 전송 객체입니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Interface Segregation: 필요한 데이터만 포함
 */
public class MenuDto {
    
    private Long id;
    private String menuCode;
    private String menuName;
    private String menuNameEn;
    private Long parentId;
    private Integer menuLevel;
    private Integer sortOrder;
    private String menuUrl;
    private String iconClass;
    private Boolean isActive;
    private Boolean isVisible;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdId;
    private String updatedId;
    
    // 하위 메뉴 목록
    private List<MenuDto> children;
    
    // 권한 정보
    private Boolean canRead;
    private Boolean canWrite;
    private Boolean canDelete;
    
    // 기본 생성자
    public MenuDto() {}
    
    // 엔티티로부터 DTO 생성하는 생성자
    public MenuDto(Menu menu) {
        this.id = menu.getId();
        this.menuCode = menu.getMenuCode();
        this.menuName = menu.getMenuName();
        this.menuNameEn = menu.getMenuNameEn();
        this.parentId = menu.getParent() != null ? menu.getParent().getId() : null;
        this.menuLevel = menu.getMenuLevel();
        this.sortOrder = menu.getSortOrder();
        this.menuUrl = menu.getMenuUrl();
        this.iconClass = menu.getIconClass();
        this.isActive = menu.getIsActive();
        this.isVisible = menu.getIsVisible();
        this.description = menu.getDescription();
        this.createdAt = menu.getCreatedAt();
        this.updatedAt = menu.getUpdatedAt();
        this.createdId = menu.getCreatedId();
        this.updatedId = menu.getUpdatedId();
        
        // N+1 쿼리 문제를 방지하기 위해 자식 메뉴는 명시적으로 설정할 때만 로딩
        // 필요한 경우 별도의 메서드나 생성자를 통해 자식 메뉴를 설정
    }
    
    // 권한 정보를 포함한 생성자
    public MenuDto(Menu menu, Boolean canRead, Boolean canWrite, Boolean canDelete) {
        this(menu);
        this.canRead = canRead;
        this.canWrite = canWrite;
        this.canDelete = canDelete;
    }
    
    // 정적 팩토리 메서드
    public static MenuDto from(Menu menu) {
        return new MenuDto(menu);
    }
    
    public static MenuDto fromWithPermissions(Menu menu, Boolean canRead, Boolean canWrite, Boolean canDelete) {
        return new MenuDto(menu, canRead, canWrite, canDelete);
    }
    
    // 엔티티 목록을 DTO 목록으로 변환
    public static List<MenuDto> fromList(List<Menu> menus) {
        return menus.stream()
                .map(MenuDto::new)
                .collect(Collectors.toList());
    }
    
    // Getter/Setter
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public Long getParentId() {
        return parentId;
    }
    
    public void setParentId(Long parentId) {
        this.parentId = parentId;
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
    
    public List<MenuDto> getChildren() {
        return children;
    }
    
    public void setChildren(List<MenuDto> children) {
        this.children = children;
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
        return "MenuDto{" +
                "id=" + id +
                ", menuCode='" + menuCode + '\'' +
                ", menuName='" + menuName + '\'' +
                ", menuLevel=" + menuLevel +
                ", sortOrder=" + sortOrder +
                ", isActive=" + isActive +
                '}';
    }
} 