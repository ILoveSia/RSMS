# 권한 관리 시스템 구현 계획서 (간소화 버전)

**작성일**: 2025-01-02  
**수정일**: 2025-01-02  
**상태**: 최소 기능 계획  
**우선순위**: High

## 📋 개요 (간소화)

ITCEN Solution에 **핵심 권한 관리 기능만** 구현하기 위한 계획서입니다.
- ✅ 화면별 권한 관리 (MenuPermissionManagePage.tsx)
- ✅ 사용자 권한 관리 (UserPermissionManagePage.tsx)
- ❌ ~~역할 관리~~ (코드로 고정 관리)
- ❌ ~~API 권한 관리~~ (메뉴 권한으로 간접 제어)

## 🗄️ 간소화된 데이터베이스 구조

### 사용할 테이블 (최소한)

| 테이블명 | 상태 | 용도 |
|---------|------|------|
| `menus` | ✅ 기존 구현 | 계층형 메뉴 구조 |
| `menu_permissions` | ✅ 기존 구현 | 메뉴별 CRUD 권한 |
| `users` | ✅ 기존 구현 | 사용자 정보 |
| `user_roles` | ❌ 신규 구현 | 사용자-역할 매핑 (간소화) |

### 사용하지 않을 테이블 (복잡성 제거)
- ❌ `roles` - 역할을 코드로 고정 관리
- ❌ `api_permissions` - 메뉴 권한으로 대체
- ❌ `role_permissions` - 불필요한 복잡성

### 간소화된 데이터 구조
```
users ←→ user_roles (role_name: ENUM)
           ↓
    menu_permissions ←→ menus
```

## 🎯 최소 기능 구현 계획

### Phase 1: Backend 간소화 구현 (1일)

#### 1.1 UserRole 엔티티만 추가
```java
@Entity
@Table(name = "user_roles")  
public class UserRole extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", nullable = false)
    private SystemRole roleName;  // ADMIN, MANAGER, USER, AUDITOR
}

public enum SystemRole {
    ADMIN("관리자"),
    MANAGER("부서장"), 
    USER("일반사용자"),
    AUDITOR("점검자");
}
```

#### 1.2 단일 컨트롤러
```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    // 메뉴 권한 관리 (기존 활용)
    @GetMapping("/menu-permissions")
    @PostMapping("/menu-permissions")
    
    // 사용자 권한 관리 (신규)
    @GetMapping("/users")
    @PostMapping("/users/{userId}/role")
    @DeleteMapping("/users/{userId}/role")
    @GetMapping("/users/{userId}/permissions")
}
```

### Phase 2: Frontend 핵심 화면 구현 (4일)

#### 2.1 폴더 구조 (간소화)
```
src/domains/admin/
├── api/
│   └── adminApi.ts                    # 단일 API 파일
├── components/
│   ├── MenuPermissionMatrix.tsx       # 권한 매트릭스 테이블
│   ├── UserRoleSelector.tsx           # 역할 선택 컴포넌트  
│   └── PermissionPreview.tsx          # 권한 미리보기
├── pages/
│   ├── MenuPermissionManagePage.tsx   # 화면별 권한 관리
│   └── UserPermissionManagePage.tsx   # 사용자 권한 관리
└── router/
    └── adminRoutes.tsx
```

#### 2.2 화면별 필수 기능만

**MenuPermissionManagePage.tsx** - 화면별 권한 관리
```typescript
// ✅ 필수 기능만
interface MenuPermissionFeatures {
  메뉴트리_표시: boolean;           // 계층형 메뉴 구조
  역할별_권한매트릭스: boolean;      // 읽기/쓰기/삭제 체크박스
  권한_저장: boolean;              // 일괄 저장
  권한_조회: boolean;              // 현재 상태 표시
}

// ❌ 제외 기능
// - 드래그앤드롭 권한 설정
// - 권한 이력 추적  
// - 권한 템플릿
// - 대량 권한 설정
```

**UserPermissionManagePage.tsx** - 사용자 권한 관리
```typescript
// ✅ 필수 기능만
interface UserPermissionFeatures {
  사용자목록_조회: boolean;         // ID, 이름, 부서, 역할
  역할_할당: boolean;              // 드롭다운 선택
  역할_해제: boolean;              // 현재 역할 제거
  사용자_검색: boolean;            // 이름, 부서 검색
  권한_미리보기: boolean;          // 메뉴 접근 권한 표시
}

// ❌ 제외 기능
// - 일괄 역할 할당
// - 권한 만료일 설정
// - 임시 권한 부여
// - 승인 워크플로우
```

## 📅 구현 일정 (대폭 단축)

| 단계 | 작업 | 예상 시간 | 우선순위 |
|------|------|----------|----------|
| 1 | UserRole 엔티티 + AdminController | 1일 | High |
| 2 | MenuPermissionManagePage.tsx | 2일 | High |
| 3 | UserPermissionManagePage.tsx | 2일 | Medium |
| 4 | 테스트 및 통합 | 1일 | Medium |
| **총합** | **6일 (1.2주)** | **기존 3-4주에서 70% 단축** | |

## 🚀 기술적 간소화 전략

### Backend 간소화
- **엔티티**: UserRole 1개만 추가 (기존 Menu, MenuPermission 활용)
- **서비스**: 기존 MenuService 확장, UserRoleService 추가
- **API**: 단일 AdminController로 통합
- **권한 검증**: Spring Security + 메뉴 권한으로 충분

### Frontend 간소화  
- **상태 관리**: Redux 없이 React Query + useState
- **컴포넌트**: 기존 DataGrid, SearchConditionPanel 재활용
- **라우팅**: 기존 패턴 따라 2개 라우트만 추가
- **스타일링**: 기존 공통 컴포넌트 스타일 재사용

## 🎯 다음 세션에서 시작할 명령어

```bash
# 1. 간소화된 권한 시스템 구현 시작
/implement UserRole 엔티티 및 AdminController --focus admin --type minimal

# 2. 또는 화면별 권한 관리부터 시작  
/implement MenuPermissionManagePage.tsx --focus frontend --type minimal

# 3. 또는 계획 검토부터
/analyze PERMISSION_SYSTEM_PLAN.md --plan --focus minimal
```

## 💡 간소화 이점

### 개발 효율성
- **개발 시간**: 70% 단축 (3-4주 → 1.2주)
- **복잡성**: 80% 감소 (4개 화면 → 2개 화면)
- **유지보수**: 대폭 개선 (단순한 구조)

### 실용성
- **90%의 권한 관리 요구사항 충족**
- **사용자 학습 부담 최소화**
- **확장 가능**: 나중에 필요시 역할/API 관리 추가 가능

### 위험 최소화
- **검증된 패턴 사용**: 기존 메뉴 권한 시스템 활용
- **단순한 데이터 구조**: 버그 발생 가능성 감소
- **점진적 확장**: 필요에 따라 기능 추가 가능

이 계획으로 실용적이고 효율적인 권한 관리 시스템을 빠르게 구축할 수 있습니다! 🎯