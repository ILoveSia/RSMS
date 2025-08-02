# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ITCEN Solution is a comprehensive financial compliance management system built with React 18.2/TypeScript frontend and Spring Boot 3.5/Java 21 backend. The system manages executive responsibilities, meeting bodies, positions, compliance tracking, audit management, and approval workflows for financial institutions.

## Development Commands

### Frontend (React/TypeScript)
```bash
cd frontend
npm run dev                # Start development server (localhost:3000)
npm run build              # Production build
npm run build:clean        # Clean build from scratch  
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues automatically
npm run type-check         # TypeScript type checking
npm run preview            # Preview production build
```

### Backend (Spring Boot/Java 21)
```bash
cd backend
./gradlew bootRun          # Start development server (localhost:8080)
./gradlew build            # Build application
./gradlew test             # Run tests
./gradlew clean            # Clean build directory
```

### Database & Infrastructure
- PostgreSQL runs on port 5433 (local) / 5432 (docker)
- Redis runs on port 6379 (session storage)
- Database init scripts are in `backend/database/init/` (34 tables)

## Architecture Overview

### Backend Architecture (Domain-Driven Design)
- **Layered Architecture**: Controller → Service → Repository → Entity
- **Domain Modules**: Each business domain has its own package
- **Package Structure**: `org.itcen.domain.{domain-name}.{controller|service|repository|entity|dto}`
- **Security**: Session-based authentication with Spring Security 6.x and Redis
- **API Context Path**: All endpoints are prefixed with `/api` (configured in application.yml)

### Frontend Architecture (Domain-Based Modules)
- **Domain Structure**: Each business domain has its own module in `src/domains/`
- **Domain Module Pattern**: `{domain}/api/`, `{domain}/components/`, `{domain}/pages/`, `{domain}/router/`, `{domain}/store/`
- **Shared Components**: Comprehensive UI component library in `src/shared/components/ui/`
- **State Management**: Redux Toolkit with custom `useAPI` hook for API integration
- **Routing**: Domain-based routing with RouteManager and lazy loading

### Key Architectural Patterns

#### Backend Domain Module Example
```
domain/audit/
├── controller/AuditProgMngtController.java    # REST endpoints
├── service/AuditProgMngtService.java          # Business logic interface
├── service/AuditProgMngtServiceImpl.java      # Business logic implementation  
├── repository/AuditProgMngtRepository.java    # Data access
├── entity/AuditProgMngt.java                  # JPA entity
└── dto/                                       # Data transfer objects
```

#### Frontend Domain Module Example
```
domains/approval/
├── api/                    # API client functions
├── components/             # Domain-specific components
├── pages/                  # Page components (ApprovalHistoryPage, MyApprovalListPage)
├── hooks/                  # Custom React hooks
├── store/                  # Redux slices
└── router/                 # Domain routing configuration
```

## Domain Structure & Implementation Status

### ✅ Fully Implemented Domains

#### **approval** - 결재 관리 시스템
- **Backend**: ApprovalController, ApprovalStep 엔티티, 34.create_table_approval_steps.sql
- **Frontend**: 
  - `ApprovalHistoryPage.tsx` - 결재 히스토리 조회
  - `MyApprovalListPage.tsx` - 내 결재 목록
  - `ApprovalDashboardPage.tsx` - 결재 대시보드
- **Features**: 다단계 결재 프로세스, 결재 상태 추적, 인라인 결재 처리

#### **audit** - 점검 관리 시스템
- **Backend**: 
  - `AuditProgMngtController` - 점검 계획 관리
  - `AuditResultController` - 점검 결과 관리
  - `DeficiencyStatusController` - 미흡 상황 관리
  - `AuditorController` - 점검자 관리
- **Frontend**:
  - `AuditProgMngtStatusPage.tsx` - 점검 계획 현황
  - `AuditItemStatusPage.tsx` - 항목별 점검 현황
  - `DeptStatusPage.tsx` - 부서별 점검 현황
  - `DeficiencyStatusPage.tsx` - 미흡 상황 현황
- **Features**: 점검 계획 수립, 점검자 지정, 점검 결과 작성, 개선 계획 관리

#### **ledgermngt** - 원장 관리 시스템
- **Backend**: 
  - `HodICItemController` - 부서장 내부통제 항목
  - `ExecutiveResponsibilityController` - 임원 책임 관리
  - `PositionResponsibilityController` - 직위 책임 관리
- **Frontend**:
  - `HodICitemStatusPage.tsx` - 부서장 내부통제 항목 현황
  - `ExecutiveStatusPage.tsx` - 임원 현황
  - `ExecutiveStatusPageWithApproval.tsx` - 임원 현황 (결재 연동)
  - `PositionStatusPage.tsx` - 직위 현황
  - `MeetingStatusPage.tsx` - 회의체 현황
  - `ResponsibilityDbStatusPage.tsx` - 책임 DB 현황
  - `StructureSubmissionStatusPage.tsx` - 구조 제출 현황
- **Features**: 원장 데이터 관리, 책임 체계 관리, 구조도 제출 관리

### ✅ Core Infrastructure Domains

#### **common** - 공통 시스템
- **Backend**: 
  - `CommonCodeController` - 공통 코드 관리
  - `AttachmentController` - 첨부파일 관리
- **Entities**: CommonCode, Attachment, Department
- **Features**: 코드 관리, 첨부파일 업로드/다운로드, 부서 정보

#### **user** - 사용자 관리
- **Backend**: UserController, User 엔티티
- **Features**: 사용자 정보 관리, 인증/인가

#### **menu** - 메뉴 관리
- **Backend**: MenuController, Menu/MenuPermission 엔티티
- **Features**: 계층형 메뉴 구조, 역할별 메뉴 권한

### 🔨 Partially Implemented Domains

#### **inquiry** - 조회 시스템
- **Status**: Frontend 화면 구현 완료, Backend API 일부 구현
- **Frontend**: AuditProgMngtStatusPage, AuditItemStatusPage, DeptStatusPage, DeficiencyStatusPage

#### **cmplcheck** - 컴플라이언스 체크
- **Status**: 기본 구조만 구현
- **Frontend**: ReviewPlanPage.tsx

### ❌ Planned but Not Implemented

#### **admin** - 시스템 관리 (권한 관리) - 간소화 버전
- **Planned Features** (간소화):
  - ✅ 화면별 권한 관리 (`MenuPermissionManagePage.tsx`) - 메뉴별 역할 권한 매트릭스
  - ✅ 사용자 권한 관리 (`UserPermissionManagePage.tsx`) - 사용자 역할 할당/해제
  - ❌ ~~역할 관리~~ - 역할을 코드로 고정 관리 (ADMIN, MANAGER, USER, AUDITOR)
  - ❌ ~~API 권한 관리~~ - 메뉴 권한으로 간접 제어
- **Database**: 기존 menu_permissions 활용 + user_roles 테이블만 추가
- **개발 기간**: 6일 (1.2주) - 기존 계획 대비 70% 단축

## Critical Implementation Details

### Backend API Development
- **Controller Mapping**: Use `@RequestMapping("/resource")` without `/api` prefix (context-path adds it automatically)
- **Entity Relationships**: Use JPA annotations with `BaseTimeEntity` for audit fields
- **Service Layer**: Always use `@Transactional(readOnly = true)` by default, override for write operations
- **Exception Handling**: Use `GlobalExceptionHandler` with `BusinessException` for business logic errors

### Frontend State Management
- **API Integration**: Use `useAPI<T>(actionType)` hook for all API calls
- **Action Registration**: Register API actions in domain store files using `registerActions()`
- **Route Registration**: Add new routes to domain router and register in `app/router/routes.tsx`
- **Component Structure**: Follow Material-UI + shared component library pattern

### Shared Component Library
The project has a comprehensive UI component library:

#### Button Components (`src/shared/components/ui/button/`)
- **Button** - Base button component
- **SearchButton** - Standardized search button with loading states
- **ExcelDownloadButton** - File download button with progress
- **ManagementButtonGroup** - CRUD operation buttons (Register/Delete)
- **ActionButtonGroup** - Custom action button groups

#### Form Components (`src/shared/components/ui/form/`)
- **SearchConditionPanel** - Search criteria container
- **CommonCodeSelect** - Dropdown for common codes
- **LedgerOrdersHodSelect** - Department order selector
- **DepartmentSelect** - Department selector with search

#### Data Display Components (`src/shared/components/ui/data-display/`)
- **DataGrid** - Enterprise data grid with sorting, filtering, pagination
- **TabContainer** - Dynamic tab management

#### Layout Components (`src/shared/components/ui/layout/`)
- **PageContainer, PageHeader, PageContent** - Consistent page structure

### Database Schema
- **Audit Fields**: All tables inherit created_at, updated_at, created_by, updated_by via `BaseTimeEntity`
- **Naming Convention**: Snake_case for database, camelCase for entities
- **Foreign Keys**: Properly defined with CASCADE constraints
- **Init Scripts**: 34 numbered scripts in `backend/database/init/`

## Domain-Specific Business Logic

### Key Business Domains

#### **ledgermngt** (원장 관리)
- Executive status and responsibility tracking
- Position management and hierarchies
- Meeting body management
- Responsibility database management
- Structure submission workflows

#### **audit** (점검 관리)
- Audit planning and management (`AuditProgMngt`)
- Auditor assignment and management
- Audit item tracking (`HodICItem`)
- Deficiency status management
- Audit result recording and approval

#### **approval** (결재 관리)
- Multi-step approval workflows
- Approval status tracking and history
- User role-based approval routing
- Inline approval processing
- Approval dashboard and monitoring

#### **inquiry** (조회)
- Status reporting across all domains
- Inspection planning and tracking
- Deficiency monitoring
- Cross-domain data aggregation

#### **common** (공통)
- Shared utilities and codes
- Attachment management
- Department structure
- Common code management

### Critical Business Rules

#### Submission Management
- **rm_submit_mgmt** table requires `submit_hist_cd` field (NOT NULL constraint)
- **Entity**: `Submission.java` includes `submitHistCd` field
- **Service**: `SubmissionServiceImpl` sets `submitHistCd` in create/update operations

#### Approval Workflow
- **Multi-step Process**: Defined in `approval_steps` table
- **Role-based Routing**: Approval steps assigned based on user roles
- **Status Tracking**: Real-time status updates across approval chain

#### Audit Management
- **Auditor Assignment**: Flexible assignment to audit items
- **Result Recording**: Structured audit result capture
- **Deficiency Tracking**: End-to-end deficiency management

## Integration Points

### Frontend-Backend API Communication
- All API calls go through `/api` context path
- Authentication handled via Redis sessions (namespace: "itcen:session")
- CORS configured for localhost:3000 in development
- Proxy configuration in Vite for development API calls

### Component Communication Patterns
- **Tab System**: Dynamic tabs managed via `TabContext` and `TabContainer`
- **Modal System**: Centralized modal management with `BaseDialog` and `useDialog` hook
- **State Sharing**: Domain stores communicate via Redux toolkit
- **Event Bus**: Cross-component communication for complex workflows

### UI Standardization
- **Consistent Button Styling**: All buttons follow standard height (32px), fontSize (0.875rem)
- **Search Patterns**: Standardized SearchConditionPanel + SearchButton pattern
- **Data Grid Configuration**: Consistent column styling and behavior
- **Error Handling**: Unified error dialog and snackbar patterns

## Environment Configuration

### Development Profiles
- **local**: Development with PostgreSQL on port 5433
- **docker**: Containerized environment with PostgreSQL on port 5432
- **prod**: Production configuration with environment variables

### Security Configuration
- **Session Management**: 3600 seconds (1 hour) timeout
- **Redis Configuration**: Session store namespace "itcen:session"
- **Authentication**: BCrypt password encoding
- **CORS**: Development frontend support
- **Security Context**: Role-based access control ready

### Technology Stack

#### Frontend Dependencies
- **React 18.2** with TypeScript
- **Material-UI 5.15** component library
- **Redux Toolkit** for state management
- **Vite** for build tooling
- **ESLint** for code quality

#### Backend Dependencies  
- **Spring Boot 3.5** with Java 21
- **Spring Security 6.x** for authentication
- **Spring Data JPA** for data access
- **Redis** for session storage
- **PostgreSQL** for primary database

## 🔐 권한 관리 시스템 구현 계획 (간소화 버전)

### 현재 권한 시스템 상태 (업데이트)
- ✅ 메뉴 권한 시스템 (Menu, MenuPermission 엔티티) 구현 완료
- ✅ 기본 사용자 인증 (User 엔티티, Spring Security) 구현 완료
- ❌ 사용자-역할 매핑 시스템 미구현 (간소화 버전으로 계획 변경)

### 간소화된 권한 구조 (database/init 폴더)
```
users ←→ user_roles (role_name: ENUM)
           ↓
    menu_permissions ←→ menus

제외된 테이블 (복잡성 제거):
❌ api_permissions      → 메뉴 권한으로 대체
❌ roles               → 코드로 고정 관리 (ADMIN, MANAGER, USER, AUDITOR)
❌ role_permissions    → 불필요한 복잡성 제거
```

### 간소화된 구현 우선순위
1. **Backend UserRole 엔티티**: 사용자-역할 매핑만 추가 (1일)
2. **AdminController**: 메뉴 권한 + 사용자 역할 관리 API (1일)
3. **MenuPermissionManagePage.tsx**: 화면별 권한 관리 (2일)
4. **UserPermissionManagePage.tsx**: 사용자 권한 관리 (2일)

### 기술적 간소화 전략
- **Backend**: 기존 Menu/MenuPermission 활용 + UserRole 엔티티만 추가
- **Frontend**: 기존 공통 컴포넌트 재사용 + 2개 페이지만 구현
- **권한 검증**: Spring Security + 메뉴 권한으로 충분
- **상태 관리**: Redux 없이 React Query + useState

### 다음 구현 단계 (간소화)
```bash
# 1. 간소화된 권한 시스템 구현
/implement UserRole 엔티티 및 AdminController --focus admin --type minimal

# 2. 화면별 권한 관리부터 시작
/implement MenuPermissionManagePage.tsx --focus frontend --type minimal

# 3. 전체 계획 검토
/analyze PERMISSION_SYSTEM_PLAN.md --plan --focus minimal
```

### 간소화 이점
- **개발 시간**: 70% 단축 (3-4주 → 1.2주)
- **복잡성**: 80% 감소 (4개 화면 → 2개 화면)  
- **유지보수**: 대폭 개선 (단순한 구조)
- **실용성**: 90%의 권한 관리 요구사항 충족

## Development Guidelines

### Code Quality Standards
- Follow SOLID principles in all implementations
- Maintain consistent error handling patterns
- Use TypeScript strict mode in frontend
- Implement comprehensive validation in backend
- Follow established naming conventions

### Testing Requirements  
- Unit tests for all service layer methods
- Integration tests for API endpoints
- Frontend component testing with React Testing Library
- E2E testing for critical user workflows

### Performance Considerations
- Use Redis caching for frequently accessed data
- Implement pagination for large datasets
- Optimize database queries with proper indexing
- Use lazy loading for frontend route components

This codebase follows enterprise-grade patterns with clear separation of concerns, comprehensive error handling, and scalable architecture suitable for financial compliance systems. The system is designed for high reliability, security, and maintainability in a regulated financial environment.