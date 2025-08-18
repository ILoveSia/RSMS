# 📺 ITCEN Solution - 화면별 테이블 사용 현황

ITCEN Solution 프로젝트의 화면별로 사용하는 데이터베이스 테이블과 주요 기능(조회/저장/수정/삭제)을 정리한 문서입니다.

## 📋 목차

1. [권한 관리 화면](#1-권한-관리-화면)
2. [메인 대시보드 화면](#2-메인-대시보드-화면)
3. [결재 관리 화면](#3-결재-관리-화면)
4. [원장 관리 화면](#4-원장-관리-화면)
5. [점검 관리 화면](#5-점검-관리-화면)
6. [인수인계 관리 화면](#6-인수인계-관리-화면)
7. [기타 화면](#7-기타-화면)

---

## 1. 권한 관리 화면

### 🔐 [900] 화면별 권한 관리 (MenuPermissionManagePage.tsx)

**사용 테이블:**
- `menus` - 메뉴 정보 조회
- `menu_permissions` - 메뉴별 역할 권한 관리
- `roles` - 역할 정보 조회

**주요 기능:**
- 📊 **조회**: 메뉴별 역할 권한 매트릭스 조회 (`adminApi.getMenuPermissionMatrix()`)
- 💾 **저장**: 메뉴별 권한 설정 업데이트 (`adminApi.updateMenuPermissions()`)
- 🔍 **필터링**: 메뉴명, 역할별 필터링
- 📈 **통계**: 역할별 권한 통계 표시

**데이터 흐름:**
```
메뉴 목록 조회 → 역할별 권한 매트릭스 생성 → 권한 변경 → 일괄 저장
```

---

### 👤 [901] 사용자 권한 관리 (UserPermissionManagePage.tsx)

**사용 테이블:**
- `users` - 사용자 기본 정보 조회
- `employee` - 직원 상세 정보 (부서명, 직급명)
- `departments` - 부서 정보
- `user_roles` - 사용자별 역할 할당 관리

**주요 기능:**
- 📊 **조회**: 사용자 목록 및 역할 할당 현황 (`adminApi.getUsersWithRoles()`)
- 👥 **사용자 관리**: 사용자 생성, 수정, 역할 할당/해제
- 🔍 **검색**: 사용자명, 부서별 검색
- 📊 **통계**: 부서별 사용자 및 역할 통계

**데이터 흐름:**
```
사용자 목록 조회 → 부서/직급 정보 조인 → 역할 할당 → 권한 변경사항 저장
```

---

## 2. 메인 대시보드 화면

### 📊 메인 대시보드 (MainPage.tsx)

**사용 테이블:**
- `approval_steps` - 결재 대기 건수 조회
- `audit_prog_mngt_detail` - 점검 업무 건수 조회  
- `ledger_orders` - 원장관리 업무 건수 조회
- `positions` - 직책 정보 조회

**주요 기능:**
- 📊 **실시간 통계**: 사용자별 업무 통계 (`mainDashboardApi.getUserWorkStats()`)
- 📈 **트렌드 분석**: 월별 업무 처리 트렌드 (`mainDashboardApi.getUserMonthlyTrends()`)
- 📋 **최근 업무**: 최근 완료 업무 목록 (`mainDashboardApi.getUserRecentTasks()`)
- 🔄 **워크플로우**: 3단계 프로세스 현황 (`mainDashboardApi.getUserWorkflowProcesses()`)

**데이터 흐름:**
```
사용자 로그인 → 실시간 데이터 조회 → 3단계 폴백 처리 → 대시보드 표시
```

---

## 3. 결재 관리 화면

### 📋 [500] 결재 히스토리 (ApprovalHistoryPage.tsx)

**사용 테이블:**
- `approval` - 결재 마스터 정보
- `approval_steps` - 결재 단계별 상세 정보
- `users` - 요청자/결재자 정보

**주요 기능:**
- 📊 **조회**: 결재 이력 조회 (`approvalApi.getApprovalHistory()`)
- 🔍 **검색**: 결재 상태, 기간별 검색
- 📄 **상세보기**: 결재 단계별 진행 상황
- 📊 **통계**: 결재 상태별 건수 통계

**데이터 흐름:**
```
결재 이력 조회 → 단계별 정보 조인 → 사용자 정보 조인 → 결재 상태 표시
```

---

### 📝 [501] 내 결재 목록 (MyApprovalListPage.tsx)

**사용 테이블:**
- `approval_steps` - 내가 결재할 항목 조회
- `approval` - 결재 기본 정보
- `hod_ic_item` - 부서장 내부통제 항목 (결재 대상)

**주요 기능:**
- 📊 **조회**: 내 결재 대기 목록 (`approvalApi.getMyApprovalList()`)
- ✅ **결재 처리**: 승인/반려 처리 (`approvalApi.processApprovalStep()`)
- 💬 **의견 입력**: 결재 의견 작성
- 🔔 **알림**: 결재 대기 건수 표시

**데이터 흐름:**
```
결재자별 대기 목록 조회 → 결재 대상 정보 조인 → 결재 처리 → 다음 단계 활성화
```

---

### 📊 [502] 결재 대시보드 (ApprovalDashboardPage.tsx)

**사용 테이블:**
- `approval` - 전체 결재 현황
- `approval_steps` - 단계별 통계
- `users` - 사용자별 결재 통계

**주요 기능:**
- 📊 **통계**: 결재 상태별 통계 (`approvalApi.getApprovalStatistics()`)
- 📈 **차트**: 월별/부서별 결재 현황 차트
- 🔍 **모니터링**: 지연 결재 모니터링
- 📋 **요약**: 결재 처리 현황 요약

---

## 4. 원장 관리 화면

### 📊 [700] 부서장 내부통제 항목 현황 (HodICitemStatusPage.tsx)

**사용 테이블:**
- `hod_ic_item` - 부서장 내부통제 항목 (메인)
- `responsibility` - 책무 정보
- `responsibility_detail` - 책무 상세 정보
- `departments` - 부서 정보
- `common_code` - 공통 코드 (항목구분, 직무구분, 주기 등)
- `approval` - 결재 상태 조회

**주요 기능:**
- 📊 **조회**: 내부통제 항목 현황 (`hodICItemApi.getHodICItemStatusList()`)
- ➕ **등록**: 새 항목 등록 (`hodICItemApi.createHodICItem()`)
- ✏️ **수정**: 항목 수정 (`hodICItemApi.updateHodICItem()`)
- 🗑️ **삭제**: 항목 삭제 (`hodICItemApi.deleteHodICItem()`)
- 📋 **결재상신**: 결재 승인 요청 (`hodICItemApi.requestApproval()`)
- 🏗️ **부서장차수생성**: 원장차수 기반 부서장차수 생성

**데이터 흐름:**
```
항목 조회 → 책무/부서/코드 정보 조인 → 결재 상태 확인 → CRUD 처리 → 결재상신
```

---

### 🏢 [701] 임원 현황 (ExecutiveStatusPage.tsx)

**사용 테이블:**
- `positions` - 직책 정보 (임원 직책)
- `execofficer` - 임원 정보
- `departments` - 부서 정보
- `employee` - 직원 정보

**주요 기능:**
- 📊 **조회**: 임원 현황 조회 (`positionApi.getExecutiveStatus()`)
- 👤 **임원 관리**: 임원 정보 등록/수정
- 🏢 **부서별 분류**: 부서별 임원 현황
- 📊 **통계**: 임원 현황 통계

---

### 📋 [702] 직위 현황 (PositionStatusPage.tsx)

**사용 테이블:**
- `positions` - 직책 정보 (메인)
- `ledger_orders` - 원장차수 정보
- `departments` - 부서 정보
- `employee` - 담당자 정보

**주요 기능:**
- 📊 **조회**: 직위 현황 조회 (`positionApi.getPositionStatus()`)
- ➕ **등록**: 직위 등록 (`positionApi.createPosition()`)
- ✏️ **수정**: 직위 수정 (`positionApi.updatePosition()`)
- 🗑️ **삭제**: 직위 삭제 (`positionApi.deletePosition()`)
- 🔍 **검색**: 부서별, 원장차수별 검색

---

### 📖 [703] 책임 DB 현황 (ResponsibilityDbStatusPage.tsx)

**사용 테이블:**
- `responsibility` - 책무 정보 (메인)
- `responsibility_detail` - 책무 상세 정보
- `common_code` - 책무 유형 코드

**주요 기능:**
- 📊 **조회**: 책임 DB 현황 (`responsibilityApi.getResponsibilityStatus()`)
- ➕ **등록**: 책무 등록 (`responsibilityApi.createResponsibility()`)
- ✏️ **수정**: 책무 수정 (`responsibilityApi.updateResponsibility()`)
- 🔍 **검색**: 책무 유형별, 키워드 검색
- 📋 **상세관리**: 책무 상세 내용 관리

---

### 🏛️ [704] 회의체 현황 (MeetingStatusPage.tsx)

**사용 테이블:**
- `meeting_body` - 회의체 정보
- `positions_meeting` - 회의체별 직책 매핑
- `positions` - 직책 정보

**주요 기능:**
- 📊 **조회**: 회의체 현황 조회
- ➕ **등록**: 회의체 등록
- 👥 **구성원 관리**: 회의체별 구성원 관리
- 📅 **일정 관리**: 회의 일정 관리

---

## 5. 점검 관리 화면

### 🔍 [600] 점검 계획 현황 (AuditProgMngtStatusPage.tsx)

**사용 테이블:**
- `audit_prog_mngt` - 점검 계획 정보 (메인)
- `audit_prog_mngt_detail` - 점검 상세 정보
- `hod_ic_item` - 점검 대상 항목
- `execofficer` - 점검 책임자

**주요 기능:**
- 📊 **조회**: 점검 계획 현황 (`auditApi.getAuditProgMngtStatus()`)
- ➕ **등록**: 점검 계획 등록 (`auditApi.createAuditProgMngt()`)
- 👥 **점검자 지정**: 점검 대상별 점검자 지정
- 📋 **진행 관리**: 점검 진행 상황 관리

---

### 📝 [601] 항목별 점검 현황 (AuditItemStatusPage.tsx)

**사용 테이블:**
- `audit_prog_mngt_detail` - 점검 상세 (메인)
- `hod_ic_item` - 점검 대상 항목
- `audit_prog_mngt` - 점검 계획
- `users` - 점검자 정보

**주요 기능:**
- 📊 **조회**: 항목별 점검 현황
- ✅ **점검 완료**: 점검 결과 입력
- 📝 **의견 작성**: 점검 의견 및 개선사항 작성
- 📊 **통계**: 점검 완료율 통계

---

### 🏢 [602] 부서별 점검 현황 (DeptStatusPage.tsx)

**사용 테이블:**
- `departments` - 부서 정보
- `audit_prog_mngt_detail` - 부서별 점검 현황
- `hod_ic_item` - 부서별 점검 항목

**주요 기능:**
- 📊 **조회**: 부서별 점검 현황 집계
- 📈 **통계**: 부서별 점검 완료율
- 🔍 **드릴다운**: 부서별 상세 점검 내역
- 📋 **보고서**: 부서별 점검 보고서 생성

---

### ⚠️ [603] 미흡 상황 현황 (DeficiencyStatusPage.tsx)

**사용 테이블:**
- `audit_prog_mngt_detail` - 점검 결과 중 미흡 항목
- `hod_ic_item` - 미흡 대상 항목
- `departments` - 부서 정보

**주요 기능:**
- 📊 **조회**: 미흡 상황 현황
- 📝 **개선계획**: 개선 계획 작성 및 관리
- 📅 **일정 관리**: 개선 완료 예정일 관리
- 📊 **진행률**: 개선 진행률 추적

---

## 6. 인수인계 관리 화면

### 🔄 [800] 인수인계 지정 관리 (HandoverAssignmentListPage.tsx)

**사용 테이블:**
- `handover_assignments` - 인수인계 지정 정보 (메인)
- `positions` - 직책 정보
- `employee` - 인계자/인수자 정보
- `handover_histories` - 인수인계 이력

**주요 기능:**
- 📊 **조회**: 인수인계 지정 현황 (`handoverApi.getHandoverAssignments()`)
- ➕ **지정**: 인수인계 대상 지정 (`handoverApi.createHandoverAssignment()`)
- 📊 **진행률**: 인수인계 진행률 관리
- 📋 **이력**: 인수인계 활동 이력 추적

**데이터 흐름:**
```
직책별 인수인계 대상 조회 → 인계자/인수자 지정 → 진행률 업데이트 → 이력 기록
```

---

### 📄 [801] 책무기술서 관리 (ResponsibilityDocumentListPage.tsx)

**사용 테이블:**
- `responsibility_documents` - 책무기술서 (메인)
- `positions` - 직책 정보
- `responsibility` - 책무 정보
- `attachments` - 첨부파일
- `approval` - 결재 정보

**주요 기능:**
- 📊 **조회**: 책무기술서 목록 (`responsibilityDocumentApi.getDocuments()`)
- ➕ **작성**: 책무기술서 작성 (`responsibilityDocumentApi.createDocument()`)
- 📎 **첨부파일**: 파일 업로드/다운로드
- 📋 **결재상신**: 문서 결재 요청
- 📝 **버전관리**: 문서 버전 관리

---

### 📖 [802] 내부통제 업무메뉴얼 (InternalControlManualListPage.tsx)

**사용 테이블:**
- `internal_control_manuals` - 내부통제 메뉴얼 (메인)
- `hod_ic_item` - 내부통제 항목
- `departments` - 부서 정보
- `attachments` - 첨부파일
- `approval` - 결재 정보

**주요 기능:**
- 📊 **조회**: 내부통제 메뉴얼 목록
- ➕ **작성**: 메뉴얼 작성 및 등록
- 📎 **첨부파일**: 메뉴얼 파일 관리
- 📋 **승인**: 부서장 승인 프로세스
- 📝 **버전관리**: 메뉴얼 버전 관리

---

### 📈 [803] 사업계획 점검 (BusinessPlanInspectionListPage.tsx)

**사용 테이블:**
- `business_plan_inspections` - 사업계획 점검 (메인)
- `departments` - 부서 정보

**주요 기능:**
- 📊 **조회**: 사업계획 점검 현황
- ➕ **등록**: 점검 계획 등록
- 📝 **결과입력**: 점검 결과 및 등급 입력
- 📊 **통계**: 부서별 점검 결과 통계
- 📋 **보고서**: 점검 결과 보고서 생성

---

## 7. 기타 화면

### 🔐 로그인 (LoginPage.tsx)

**사용 테이블:**
- `users` - 사용자 인증 정보
- `employee` - 직원 정보 조회

**주요 기능:**
- 🔑 **인증**: 사용자 로그인 인증
- 🔒 **세션**: 세션 생성 및 관리
- 👤 **프로필**: 사용자 프로필 정보 로드

---

### 📋 컴플라이언스 체크 (ReviewPlanPage.tsx)

**사용 테이블:**
- (기본 구조만 구현, 테이블 연동 미완료)

**주요 기능:**
- 📋 **계획수립**: 컴플라이언스 점검 계획
- 📊 **현황조회**: 점검 현황 모니터링

---

## 📊 테이블 사용 빈도 통계

### 🔥 가장 많이 사용되는 테이블 (TOP 10)

| 순위 | 테이블명 | 사용 화면 수 | 주요 용도 |
|------|----------|-------------|----------|
| 1 | `approval` | 8개 화면 | 결재 시스템 (범용) |
| 2 | `hod_ic_item` | 7개 화면 | 부서장 내부통제 항목 |
| 3 | `departments` | 6개 화면 | 부서 정보 참조 |
| 4 | `positions` | 6개 화면 | 직책 정보 관리 |
| 5 | `users` | 5개 화면 | 사용자 정보 |
| 6 | `employee` | 5개 화면 | 직원 정보 |
| 7 | `responsibility` | 4개 화면 | 책무 정보 |
| 8 | `common_code` | 4개 화면 | 공통 코드 참조 |
| 9 | `attachments` | 3개 화면 | 첨부파일 관리 |
| 10 | `approval_steps` | 3개 화면 | 결재 단계 관리 |

### 📈 도메인별 테이블 사용 분포

| 도메인 | 주요 테이블 | 화면 수 | 특징 |
|--------|------------|---------|------|
| **권한 관리** | users, user_roles, menus, menu_permissions | 2개 | RBAC 구현 |
| **메인 대시보드** | approval_steps, audit_prog_mngt_detail, positions | 1개 | 실시간 통계 |
| **결재 관리** | approval, approval_steps | 3개 | 다단계 결재 |
| **원장 관리** | hod_ic_item, positions, responsibility | 6개 | 가장 복잡한 도메인 |
| **점검 관리** | audit_prog_mngt, audit_prog_mngt_detail | 4개 | 점검 프로세스 |
| **인수인계 관리** | handover_assignments, responsibility_documents | 3개 | 문서 중심 |

---

## 🔗 테이블 간 주요 연결 관계

### 📊 핵심 연결점

1. **approval 테이블**: 범용 결재 시스템의 중심
   - `task_type_cd` + `task_id`로 모든 업무와 연결
   - hod_ic_item, responsibility_documents, internal_control_manuals 등과 연동

2. **hod_ic_item 테이블**: 원장 관리의 핵심
   - responsibility, positions, approval, audit 등과 연결
   - 가장 많은 화면에서 참조되는 테이블

3. **positions 테이블**: 직책 관리의 중심
   - 원장 관리, 인수인계, 결재자 지정 등에 활용

4. **departments 테이블**: 조직 구조의 기반
   - 대부분의 도메인에서 부서별 분류에 활용

5. **common_code 테이블**: 코드 관리의 중심
   - 각종 상태코드, 구분코드 관리

---

*이 문서는 ITCEN Solution 프로젝트의 화면별 데이터베이스 사용 현황을 정리한 문서입니다.*  
*최종 업데이트: 2025-01-14*