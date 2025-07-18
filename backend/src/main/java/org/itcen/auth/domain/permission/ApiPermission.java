package org.itcen.auth.domain.permission;

import java.util.ArrayList;
import java.util.List;
import org.itcen.common.entity.BaseTimeEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * API 권한 엔티티
 *
 * SOLID 원칙: - 단일 책임: API 권한 정보만 담당 - 개방-폐쇄: 새로운 권한 타입 추가 시 확장 가능 - 리스코프 치환: BaseTimeEntity의 모든 동작
 * 지원 - 인터페이스 분리: 필요한 기능만 노출 - 의존성 역전: 구현체가 아닌 추상화에 의존
 */
@Entity(name = "ApiPermission")
@Table(name = "api_permissions")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiPermission extends BaseTimeEntity {

    /**
     * 권한 ID (Primary Key)
     */
    @Id
    @Column(name = "permission_id", length = 20)
    private String permissionId;

    /**
     * API 패턴 (URL 패턴)
     */
    @Column(name = "api_pattern", nullable = false, length = 200)
    private String apiPattern;

    /**
     * HTTP 메서드 (GET, POST, PUT, DELETE, null은 모든 메서드)
     */
    @Column(name = "http_method", length = 10)
    private String httpMethod;

    /**
     * 권한명
     */
    @Column(name = "permission_name", nullable = false, length = 100)
    private String permissionName;

    /**
     * 권한 설명
     */
    @Column(length = 500)
    private String description;

    /**
     * 공개 API 여부
     */
    @Builder.Default
    @Column(name = "is_public", nullable = false, length = 1)
    private String isPublic = "N";

    /**
     * 사용 여부
     */
    @Builder.Default
    @Column(name = "use_yn", nullable = false, length = 1)
    private String useYn = "Y";

    /**
     * 역할-권한 매핑 (양방향 관계)
     */
    @OneToMany(mappedBy = "apiPermission", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<RolePermission> rolePermissions = new ArrayList<>();

    /**
     * 공개 API 설정
     */
    public void makePublic() {
        this.isPublic = "Y";
    }

    /**
     * 비공개 API 설정
     */
    public void makePrivate() {
        this.isPublic = "N";
    }

    /**
     * 공개 API 여부 확인
     */
    public boolean isPublicApi() {
        return "Y".equals(this.isPublic);
    }

    /**
     * 권한 활성화
     */
    public void activate() {
        this.useYn = "Y";
    }

    /**
     * 권한 비활성화
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
     * API 권한 생성을 위한 정적 팩토리 메서드
     */
    public static ApiPermission createPermission(String permissionId, String apiPattern,
            String httpMethod, String permissionName, String description, boolean isPublic) {
        return ApiPermission.builder().permissionId(permissionId).apiPattern(apiPattern)
                .httpMethod(httpMethod).permissionName(permissionName).description(description)
                .isPublic(isPublic ? "Y" : "N").useYn("Y").build();
    }
}
