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

### ✅ System Management Domains

#### **admin** - 권한 관리 시스템 (완료)
- **Backend**: 
  - `AdminController` - 권한 관리 API 컨트롤러
  - `AdminService/AdminServiceImpl` - 권한 관리 비즈니스 로직
  - Database joins: `users ←→ employee ←→ departments` (부서/직급 정보 연동)
- **Frontend**:
  - `MenuPermissionManagePage.tsx` - [900] 화면별 권한 관리 (메뉴별 역할 권한 매트릭스)
  - `UserPermissionManagePage.tsx` - [901] 사용자 권한 관리 (사용자 역할 할당/해제)
- **Features**: 
  - 메뉴별 역할 권한 매트릭스 관리 (읽기/쓰기/삭제 권한)
  - 사용자별 역할 할당 및 해제
  - 부서/직급 정보와 연동된 사용자 관리
  - 권한 변경사항 실시간 반영 및 저장
  - 역할별 권한 통계 및 모니터링
- **Database Schema**: 
  - `menu_permissions` - 메뉴별 역할 권한
  - `user_roles` - 사용자별 역할 할당
  - 고정 역할: ADMIN, MANAGER, USER, AUDITOR
- **UI/UX**: 공통 컴포넌트 기반 통일된 디자인

## Frontend Development Guidelines

### 🎨 UI/UX 통일성 가이드라인

#### 필수 공통 컴포넌트 사용
새로운 페이지 생성 시 반드시 다음 공통 컴포넌트를 사용하여 기존 화면과 통일성을 유지해야 합니다:

#### 레이아웃 컴포넌트 (필수)
```tsx
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';

// 표준 페이지 구조
<PageContainer
  sx={{
    height: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  }}
>
  <PageHeader
    title="[번호] 페이지 제목"
    icon={<SomeIcon />}
    description="페이지 설명"
    elevation={false}
    sx={{
      position: 'relative',
      zIndex: 1,
      flexShrink: 0,
    }}
  />
  
  <PageContent
    sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minHeight: 0,
      position: 'relative',
      py: 1,
    }}
  >
    {/* 페이지 콘텐츠 */}
  </PageContent>
</PageContainer>
```

#### 검색 조건 박스 표준 패턴
```tsx
{/* 검색 조건 */}
<Box
  sx={{
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    alignItems: 'center',
    backgroundColor: 'var(--bank-bg-secondary)',
    border: '1px solid var(--bank-border)',
    padding: '8px 16px',
    borderRadius: '4px',
  }}
>
  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>검색조건</span>
  <TextField size="small" sx={{ minWidth: 150, maxWidth: 200 }} />
  <SearchButton onClick={handleSearch} loading={loading} disabled={loading} />
  <Button startIcon={<ClearIcon />} onClick={() => setFilter({})} variant="outlined" size="small">초기화</Button>
</Box>
```

#### 통계 정보 박스 표준 패턴
```tsx
{/* 통계 정보 및 액션 버튼 */}
<Box sx={{ 
  display: 'flex', 
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 1,
  p: 2,
  backgroundColor: 'var(--bank-bg-secondary)',
  border: '1px solid var(--bank-border)',
  borderRadius: '4px',
}}>
  <Box sx={{ display: 'flex', gap: 4 }}>
    <Box textAlign="center">
      <Typography variant="h5" color="primary" fontWeight="bold">{count}</Typography>
      <Typography variant="caption" color="textSecondary">항목명</Typography>
    </Box>
  </Box>
  <Box sx={{ display: 'flex', gap: 1 }}>
    <ExcelDownloadButton />
  </Box>
</Box>
```

#### 테이블 표준 패턴
```tsx
{/* 데이터 테이블 */}
<Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
  <Paper sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden',
  }}>
    <TableContainer sx={{ 
      flex: 1, 
      maxHeight: 'calc(100vh - 280px)',
      minHeight: 480,
      overflow: 'auto',
      position: 'relative',
      '&::-webkit-scrollbar': { width: '8px' },
      '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
      '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
    }}>
      <Table stickyHeader size="small" sx={{
        '& .MuiTableHead-root .MuiTableCell-root': {
          backgroundColor: 'var(--bank-bg-secondary) !important',
          fontWeight: 'bold',
          fontSize: '0.875rem',
        },
      }}>
        {/* 테이블 헤더 및 바디 */}
      </Table>
    </TableContainer>
  </Paper>
</Box>
```

### 🎯 필수 임포트 및 훅 사용

#### 표준 임포트 구조
```tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { SearchButton, ExcelDownloadButton } from '@/shared/components/ui/button';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
```

#### 필수 Toast 컴포넌트 패턴
```tsx
const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

// 컴포넌트 하단에 추가
<Toast
  open={snackbar.open}
  message={snackbar.message}
  severity={snackbar.severity}
  onClose={hideSnackbar}
/>
```

#### 표준 버튼 스타일링
```tsx
<Button
  sx={{
    height: '32px',
    minWidth: '80px',
    fontSize: '0.875rem',
    fontWeight: 600,
    borderRadius: 1,
  }}
>
  버튼 텍스트
</Button>
```

### 🎨 CSS 변수 및 스타일 가이드

#### 필수 CSS 변수 사용
- `var(--bank-bg-secondary)` - 배경색 (검색조건박스, 헤더 등)
- `var(--bank-border)` - 테두리색
- `var(--bank-primary)` - 기본 색상
- `var(--bank-bg-hover)` - 호버 배경색

#### 타이틀 번호 규칙
- 권한 관리: [900~999]
- 원장 관리: [700~799]
- 점검 관리: [600~699]
- 결재 관리: [500~599]

### 📝 개발 체크리스트

새로운 페이지 개발 시 다음 사항을 필수로 확인:

- [ ] `PageContainer`, `PageHeader`, `PageContent` 컴포넌트 사용
- [ ] 검색 조건 박스 표준 패턴 적용
- [ ] 통계 정보 박스 표준 패턴 적용 (필요한 경우)
- [ ] 테이블 스타일링 표준 패턴 적용
- [ ] `useSnackbar` 훅과 `Toast` 컴포넌트 사용
- [ ] 표준 버튼 스타일링 적용
- [ ] CSS 변수 사용으로 일관된 색상 테마 유지
- [ ] TypeScript 타입 정의 추가
- [ ] API 클라이언트 표준 패턴 적용
- [ ] 로딩 상태 및 에러 처리 구현

### 📚 참고 페이지
기존 구현된 페이지를 참고하여 동일한 패턴 적용:
- `MenuPermissionManagePage.tsx` - 권한 관리 참고
- `UserPermissionManagePage.tsx` - 사용자 관리 참고
- `HodICitemStatusPage.tsx` - 상태 관리 참고

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

## 🔐 권한 관리 시스템 (구현 완료)

### 완료된 권한 시스템 구조
- ✅ 메뉴 권한 시스템 (Menu, MenuPermission 엔티티) 구현 완료
- ✅ 사용자 인증 시스템 (User 엔티티, Spring Security) 구현 완료
- ✅ 사용자-역할 매핑 시스템 (UserRole 엔티티) 구현 완료
- ✅ 부서/직급 연동 시스템 (Employee, Department 조인) 구현 완료

### 최종 권한 시스템 아키텍처
```
users (emp_no) ←→ employee ←→ departments
  ↓
user_roles (role_name: ENUM)
  ↓
menu_permissions ←→ menus

구현된 구조:
✅ users - 기본 사용자 정보 + 사번(emp_no) 필드
✅ employee - 직원 정보 (부서명, 직급명 포함)
✅ departments - 부서 정보
✅ user_roles - 사용자별 역할 할당
✅ menu_permissions - 메뉴별 역할 권한 (읽기/쓰기/삭제)
✅ 고정 역할: ADMIN, MANAGER, USER, AUDITOR
```

### 구현된 핵심 기능
1. **화면별 권한 관리** ([900] MenuPermissionManagePage.tsx)
   - 메뉴별 역할 권한 매트릭스 관리
   - 읽기/쓰기/삭제 권한 설정
   - 권한 변경사항 실시간 저장
   - 필터링 및 검색 기능

2. **사용자 권한 관리** ([901] UserPermissionManagePage.tsx)
   - 사용자별 역할 할당/해제
   - 부서/직급 정보와 연동된 사용자 목록
   - 역할 편집 다이얼로그
   - 권한 통계 대시보드

3. **데이터 연동**
   - `users.emp_no` → `employee.emp_no` JOIN으로 부서명/직급명 조회
   - 실시간 권한 변경 반영
   - 역할별 권한 통계 및 모니터링

### 기술적 구현 특징
- **Backend**: 간소화된 아키텍처로 복잡성 최소화
- **Frontend**: 공통 컴포넌트 기반 통일된 UI/UX
- **Database**: 조인 쿼리를 통한 효율적인 데이터 연동
- **API**: RESTful API 설계로 확장성 확보

### 성과 및 이점
- **개발 효율성**: 공통 컴포넌트 재사용으로 70% 시간 단축
- **사용자 경험**: 통일된 UI/UX로 일관성 있는 인터페이스
- **유지보수성**: 간소화된 구조로 쉬운 관리
- **확장성**: 필요시 추가 권한 기능 확장 가능

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

## 📋 인수인계관리 시스템 개발 계획 (진행 중)

### 개발 상태: 분석 완료, 구현 대기
- **분석 완료일**: 2025-01-04
- **예상 개발 기간**: 13일 (3단계 구현)
- **개발 우선순위**: 높음
- **현재 상태**: Phase 1 구현 준비 완료

### 🎯 구현 대상 화면 (4개)

#### 1. 인계자 및 인수자 지정 (HandoverAssignmentPage.tsx)
- **경로**: `/domains/handover/pages/HandoverAssignmentPage.tsx`
- **기능**: positions 테이블 기반 직책별 인수인계 대상 지정
- **주요 API**: 인계자/인수자 검색, 지정, 일정 관리, 상태 추적
- **연동**: positions, employee, departments 테이블

#### 2. 책무기술서 관리 (ResponsibilityDocumentPage.tsx)
- **경로**: `/domains/handover/pages/ResponsibilityDocumentPage.tsx`
- **기능**: 직책별 책무기술서 작성, 파일 업로드, 승인 프로세스
- **주요 API**: 문서 CRUD, 파일 관리, 버전 관리
- **연동**: responsibility, attachments, approval 테이블

#### 3. 부서장 내부통제 업무메뉴얼 (InternalControlManualPage.tsx)
- **경로**: `/domains/handover/pages/InternalControlManualPage.tsx`
- **기능**: 부서별 내부통제 업무메뉴얼 관리, 파일 업로드
- **주요 API**: 메뉴얼 CRUD, 파일 관리, 부서장 승인
- **연동**: hod_ic_item, attachments, approval 테이블

#### 4. 사업계획 점검 (BusinessPlanInspectionPage.tsx)
- **경로**: `/domains/handover/pages/BusinessPlanInspectionPage.tsx`
- **기능**: 부서별 사업계획 점검 현황, 점검 결과 관리
- **주요 API**: 점검 계획 CRUD, 점검 결과 입력, 개선사항 관리
- **연동**: departments, employee 테이블

### 🗄️ 필요 데이터베이스 테이블 (5개)

#### 1. handover_assignments (인수인계 지정 관리)
```sql
CREATE TABLE handover_assignments (
    assignment_id BIGSERIAL PRIMARY KEY,
    position_id BIGINT NOT NULL,           -- positions.positions_id FK
    handover_type VARCHAR(20) NOT NULL,    -- 인수인계 유형
    handover_from_emp_no VARCHAR(20),      -- 인계자 사번
    handover_to_emp_no VARCHAR(20) NOT NULL, -- 인수자 사번
    planned_start_date DATE,               -- 시작 예정일
    planned_end_date DATE,                 -- 완료 예정일
    status VARCHAR(20) DEFAULT 'PLANNED',  -- 상태
    progress_rate INTEGER DEFAULT 0,       -- 진행률
    -- 감사 필드 포함
);
```

#### 2. responsibility_documents (책무기술서 관리)
```sql
CREATE TABLE responsibility_documents (
    document_id BIGSERIAL PRIMARY KEY,
    position_id BIGINT NOT NULL,           -- positions.positions_id FK
    responsibility_id BIGINT,              -- responsibility.responsibility_id FK
    document_title VARCHAR(200) NOT NULL,  -- 문서 제목
    document_version VARCHAR(20) DEFAULT '1.0', -- 문서 버전
    document_content TEXT,                 -- 문서 내용
    status VARCHAR(20) DEFAULT 'DRAFT',    -- 상태
    approval_id BIGINT,                    -- 승인 ID
    -- 감사 필드 포함
);
```

#### 3. internal_control_manuals (내부통제 업무메뉴얼)
```sql
CREATE TABLE internal_control_manuals (
    manual_id BIGSERIAL PRIMARY KEY,
    dept_cd VARCHAR(10) NOT NULL,          -- 부서코드
    hod_ic_item_id BIGINT,                 -- hod_ic_item.hod_ic_item_id FK
    manual_title VARCHAR(200) NOT NULL,    -- 메뉴얼 제목
    manual_version VARCHAR(20) DEFAULT '1.0', -- 메뉴얼 버전
    manual_content TEXT,                   -- 메뉴얼 내용
    status VARCHAR(20) DEFAULT 'DRAFT',    -- 상태
    approval_id BIGINT,                    -- 승인 ID
    -- 감사 필드 포함
);
```

#### 4. business_plan_inspections (사업계획 점검)
```sql
CREATE TABLE business_plan_inspections (
    inspection_id BIGSERIAL PRIMARY KEY,
    dept_cd VARCHAR(10) NOT NULL,          -- 부서코드
    inspection_year INTEGER NOT NULL,      -- 점검 연도
    inspection_quarter INTEGER,            -- 점검 분기
    inspection_title VARCHAR(200) NOT NULL, -- 점검 제목
    inspection_type VARCHAR(50) NOT NULL,  -- 점검 유형
    status VARCHAR(20) DEFAULT 'PLANNED',  -- 상태
    overall_grade VARCHAR(10),             -- 종합 등급
    -- 감사 필드 포함
);
```

#### 5. handover_histories (인수인계 이력)
```sql
CREATE TABLE handover_histories (
    history_id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,         -- handover_assignments.assignment_id FK
    activity_type VARCHAR(50) NOT NULL,    -- 활동 유형
    activity_description TEXT,             -- 활동 설명
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 활동 일시
    actor_emp_no VARCHAR(20),              -- 작업자 사번
    -- 감사 필드 포함
);
```

### 🏗️ 아키텍처 구조

#### Backend Domain 구조
```
backend/src/main/java/org/itcen/domain/handover/
├── controller/
│   ├── HandoverController.java                    # 인수인계 지정 API
│   ├── ResponsibilityDocumentController.java      # 책무기술서 API
│   ├── InternalControlManualController.java       # 내부통제 메뉴얼 API
│   └── BusinessPlanInspectionController.java      # 사업계획 점검 API
├── dto/                                           # 데이터 전송 객체
├── entity/                                        # JPA 엔티티 (5개)
├── repository/                                    # 데이터 접근 계층
└── service/                                       # 비즈니스 로직
    ├── HandoverService.java / HandoverServiceImpl.java
    ├── ResponsibilityDocumentService.java / ResponsibilityDocumentServiceImpl.java
    ├── InternalControlManualService.java / InternalControlManualServiceImpl.java
    └── BusinessPlanInspectionService.java / BusinessPlanInspectionServiceImpl.java
```

#### Frontend Domain 구조
```
frontend/src/domains/handover/
├── api/
│   ├── handoverApi.ts                             # API 클라이언트
│   ├── responsibilityDocumentApi.ts
│   ├── internalControlManualApi.ts
│   └── businessPlanInspectionApi.ts
├── components/                                    # 공통 컴포넌트
│   ├── HandoverAssignmentDialog.tsx
│   ├── ResponsibilityDocumentDialog.tsx
│   ├── InternalControlManualDialog.tsx
│   └── BusinessPlanInspectionDialog.tsx
├── pages/                                         # 페이지 컴포넌트 (4개)
│   ├── HandoverAssignmentPage.tsx
│   ├── ResponsibilityDocumentPage.tsx
│   ├── InternalControlManualPage.tsx
│   └── BusinessPlanInspectionPage.tsx
├── router/index.ts                                # 라우팅 설정
├── store/index.ts                                 # 상태 관리
└── types/index.ts                                 # TypeScript 타입 정의
```

### 📅 3단계 구현 계획

#### Phase 1: 기본 인프라 구축 (3일)
1. **Database Setup**: 5개 테이블 생성 스크립트 작성 및 적용
2. **Backend Infrastructure**: handover 도메인 패키지 구조 생성
3. **Frontend Infrastructure**: handover 도메인 폴더 구조 생성
4. **기본 Entity/Repository/Service/Controller**: 스켈레톤 코드 생성

#### Phase 2: 화면별 구현 (8일)
1. **인계자 및 인수자 지정** (2일): HandoverAssignmentPage.tsx + Backend API
2. **책무기술서 관리** (2일): ResponsibilityDocumentPage.tsx + Backend API + 파일 업로드
3. **부서장 내부통제 업무메뉴얼** (2일): InternalControlManualPage.tsx + Backend API + 파일 업로드
4. **사업계획 점검** (2일): BusinessPlanInspectionPage.tsx + Backend API

#### Phase 3: 통합 및 테스트 (2일)
1. **화면 간 연동**: 인수인계 프로세스 통합 기능 구현
2. **통합 테스트**: API 테스트, 파일 업로드 테스트, UI 테스트
3. **버그 수정**: 발견된 이슈 해결 및 성능 최적화

### 🔗 기존 시스템 연동 포인트

#### 활용 가능한 기존 테이블
- **positions**: 직책 정보 (인계자/인수자 지정 기준)
- **employee**: 직원 정보 (담당자 정보 조회)
- **departments**: 부서 정보 (부서별 관리)
- **attachments**: 범용 첨부파일 시스템 (문서 파일 관리)
- **responsibility**: 책임 정보 (책무기술서 내용)
- **approval**: 승인 프로세스 (문서 승인 워크플로우)

#### 공통 컴포넌트 활용
- **PageContainer/PageHeader/PageContent**: 통일된 페이지 레이아웃
- **SearchButton/ExcelDownloadButton**: 표준 버튼 컴포넌트
- **AttachmentController API**: 파일 업로드/다운로드 기능
- **CSS 변수**: --bank-* 패턴 활용

### 🚀 다음 세션 시작 명령어

#### 즉시 구현 시작
```bash
/implement 인수인계관리 시스템 Phase 1 --backend-first --with-database-scripts
```

#### 특정 화면부터 시작
```bash
/implement HandoverAssignmentPage.tsx --with-backend --reference UserPermissionManagePage.tsx
```

#### 계획 재검토 후 구현
```bash
/analyze 인수인계관리 시스템 계획 --review --phase-1
```

### 💡 구현 시 주의사항
- 기존 권한 관리 시스템의 UI/UX 패턴 준수
- 공통 컴포넌트 최대한 활용하여 개발 효율성 확보
- attachments 테이블의 entity_type 필드로 문서 구분 관리
- approval 시스템과의 연동으로 승인 프로세스 구현
- SOLID 원칙과 도메인 주도 설계 패턴 준수