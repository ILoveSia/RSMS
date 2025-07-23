# 공통 컴포넌트 목록

## 📋 전체 컴포넌트 (35개)

### 🔘 버튼 컴포넌트 (1개)

#### Button
- **경로**: `@/shared/components/ui/button`
- **기능**: 표준 버튼 컴포넌트
- **특징**: 로딩 상태 지원, 아이콘 지원, 다양한 variant와 color 옵션
- **용도**: 모든 버튼 액션 (저장, 취소, 검색 등)

---

### 📊 데이터 표시 컴포넌트 (6개)

#### DataGrid
- **경로**: `@/shared/components/ui/data-display`
- **기능**: 클라이언트 사이드 데이터 테이블
- **특징**: 체크박스 선택, 행 클릭 이벤트, 페이지네이션, 정렬
- **용도**: 소규모 데이터 목록 표시

#### ServerDataGrid
- **경로**: `@/shared/components/ui/data-display`
- **기능**: 서버 사이드 데이터 테이블
- **특징**: 서버 검색/정렬/필터링, 데이터 내보내기, 일괄 삭제, 자동 새로고침
- **용도**: 대용량 데이터 목록 표시 및 관리

#### Badge
- **경로**: `@/shared/components/ui/data-display`
- **기능**: 상태나 카운트 표시 배지
- **특징**: 다양한 색상과 variant, dot 형태 지원
- **용도**: 알림 개수, 상태 표시

#### Chip
- **경로**: `@/shared/components/ui/data-display`
- **기능**: 태그나 필터 표현 칩
- **특징**: 삭제 가능, 다양한 색상과 variant
- **용도**: 태그, 필터 조건, 선택된 항목 표시

#### InfoCard
- **경로**: `@/shared/components/ui/data-display`
- **기능**: 정보 표시용 카드
- **특징**: 제목과 내용 구분 표시
- **용도**: 통계 정보, 요약 정보 표시

#### TextField
- **경로**: `@/shared/components/ui/data-display`
- **기능**: 읽기 전용 텍스트 필드
- **특징**: 다양한 포맷 지원 (날짜, 숫자 등)
- **용도**: 상세 정보 표시, 읽기 전용 데이터

---

### 📝 폼 입력 컴포넌트 (9개)

#### Select
- **경로**: `@/shared/components/ui/form`
- **기능**: 드롭다운 선택 컴포넌트
- **특징**: 단일/다중 선택, 그룹핑, 검색 가능, 클리어 가능
- **용도**: 옵션 선택 (부서, 상태, 카테고리 등)

#### ComboBox
- **경로**: `@/shared/components/ui/form`
- **기능**: 자동완성 선택 컴포넌트
- **특징**: 검색 기능, 자유 입력 모드, 다중 선택, 비동기 로딩
- **용도**: 사용자 검색, 태그 입력, 동적 옵션 선택

#### DatePicker
- **경로**: `@/shared/components/ui/form`
- **기능**: 커스텀 달력 날짜 선택
- **특징**: 커스텀 달력 UI, 날짜 제한, 다양한 뷰 모드
- **용도**: 날짜 입력 (기간 설정, 생년월일 등)

#### FileUpload
- **경로**: `@/shared/components/ui/form`
- **기능**: 파일 업로드 컴포넌트
- **특징**: 드래그 앤 드롭, 파일 타입 제한, 프리뷰
- **용도**: 문서 첨부, 이미지 업로드

#### ServerFileUpload
- **경로**: `@/shared/components/ui/form`
- **기능**: 서버 연동 파일 업로드
- **특징**: 서버 API 연동, 업로드 진행률, 에러 처리
- **용도**: 실제 서버로 파일 업로드

#### CommonCodeSelect
- **경로**: `@/shared/components/ui/form`
- **기능**: 공통코드 선택 컴포넌트
- **특징**: 공통코드 API 자동 연동, 캐싱
- **용도**: 시스템 공통코드 선택

#### LedgerOrderSelect
- **경로**: `@/shared/components/ui/form`
- **기능**: 원장계정 선택 컴포넌트
- **특징**: 원장계정 API 연동, 계층 구조 지원
- **용도**: 회계 관련 원장계정 선택

#### LedgerOrdersHodSelect
- **경로**: `@/shared/components/ui/form`
- **기능**: 책무번호 선택 컴포넌트
- **특징**: 책무번호 API 연동, 실시간 검색
- **용도**: 감사 및 책임 관리에서 책무번호 선택

#### PositionSelect
- **경로**: `@/shared/components/ui/form`
- **기능**: 직책 선택 컴포넌트
- **특징**: 직책 API 연동, 조직도 기반
- **용도**: 인사 관리에서 직책 선택

---

### 📐 레이아웃 컴포넌트 (6개)

#### PageContainer
- **경로**: `@/shared/components/ui/layout`
- **기능**: 페이지 전체 컨테이너
- **특징**: 탭 시스템 감지, 반응형 레이아웃, 최대 너비 설정
- **용도**: 모든 페이지의 최상위 컨테이너

#### PageHeader
- **경로**: `@/shared/components/ui/layout`
- **기능**: 페이지 헤더
- **특징**: 제목, 부제목, 아이콘, 액션 버튼, 브레드크럼 지원
- **용도**: 페이지 상단 헤더 영역

#### PageContent
- **경로**: `@/shared/components/ui/layout`
- **기능**: 페이지 본문 영역
- **특징**: 스크롤 영역, 패딩 설정
- **용도**: 페이지 메인 콘텐츠 영역

#### Card
- **경로**: `@/shared/components/ui/layout`
- **기능**: 카드 형태 컨테이너
- **특징**: 제목, 액션, 다양한 elevation
- **용도**: 정보 그룹핑, 섹션 구분

#### Drawer
- **경로**: `@/shared/components/ui/layout`
- **기능**: 서랍 패널
- **특징**: 좌/우/상/하 방향, 오버레이/고정 모드
- **용도**: 사이드 메뉴, 필터 패널

#### Tabs
- **경로**: `@/shared/components/ui/layout`
- **기능**: 탭 레이아웃
- **특징**: 수평/수직 탭, 스크롤 가능
- **용도**: 콘텐츠 분류 및 전환

---

### 💬 피드백 컴포넌트 (6개)

#### Alert
- **경로**: `@/shared/components/ui/feedback`
- **기능**: 알림 메시지
- **특징**: 4가지 심각도 레벨, 제목 지원, 닫기 버튼, 커스텀 액션
- **용도**: 성공/오류/경고/정보 메시지 표시

#### Loading
- **경로**: `@/shared/components/ui/feedback`
- **기능**: 로딩 인디케이터
- **특징**: 메시지 지원, 전체 화면 오버레이 모드
- **용도**: 데이터 로딩 중 상태 표시

#### LoadingProvider
- **경로**: `@/shared/components/ui/feedback`
- **기능**: 로딩 상태 전역 관리
- **특징**: Context API 기반, 중첩 로딩 처리
- **용도**: 앱 전체 로딩 상태 관리

#### Modal
- **경로**: `@/shared/components/ui/feedback`
- **기능**: 범용 모달 컨테이너
- **특징**: 다양한 크기, 백드롭 클릭 설정
- **용도**: 커스텀 모달 구현

#### Toast
- **경로**: `@/shared/components/ui/feedback`
- **기능**: 토스트 알림
- **특징**: 자동 사라짐, 위치 설정, 스택 관리
- **용도**: 간단한 피드백 메시지

#### ToastProvider
- **경로**: `@/shared/components/ui/feedback`
- **기능**: 토스트 전역 관리
- **특징**: Context API 기반, 큐 관리
- **용도**: 앱 전체 토스트 알림 관리

---

### 🧭 네비게이션 컴포넌트 (3개)

#### Breadcrumb
- **경로**: `@/shared/components/ui/navigation`
- **기능**: 브레드크럼 네비게이션
- **특징**: 아이콘 지원, 링크/클릭 이벤트, 긴 경로 축약
- **용도**: 현재 위치 표시 및 상위 페이지 이동

#### Pagination
- **경로**: `@/shared/components/ui/navigation`
- **기능**: 페이지네이션
- **특징**: 첫/마지막 페이지 버튼, 페이지 점프
- **용도**: 목록 데이터 페이지 이동

#### Stepper
- **경로**: `@/shared/components/ui/navigation`
- **기능**: 단계 표시기
- **특징**: 수평/수직 방향, 단계별 상태 관리
- **용도**: 다단계 프로세스 진행 상황 표시

---

### 🗂️ 모달 컴포넌트 (4개)

#### BaseDialog
- **경로**: `@/shared/components/modal`
- **기능**: 기본 다이얼로그
- **특징**: 4가지 모드 (생성/편집/보기/읽기전용), 모드 자동 전환, 로딩 상태
- **용도**: 모든 폼 다이얼로그의 기본 베이스

#### Alert
- **경로**: `@/shared/components/modal`
- **기능**: 알림 다이얼로그
- **특징**: 확인/취소 버튼, 커스텀 메시지
- **용도**: 사용자 알림 및 확인

#### Confirm
- **경로**: `@/shared/components/modal`
- **기능**: 확인 다이얼로그
- **특징**: 예/아니오 선택, 위험 작업 확인
- **용도**: 삭제, 취소 등 중요한 작업 확인

#### Dialog
- **경로**: `@/shared/components/modal`
- **기능**: 범용 다이얼로그
- **특징**: 커스텀 헤더/바디/푸터
- **용도**: 특수한 용도의 다이얼로그 구현

---

### 📑 탭 시스템 (3개)

#### TabContainer
- **경로**: `@/shared/components/tabs`
- **기능**: 탭 시스템 메인 컨테이너
- **특징**: TabContext 연동, 탭 순서 변경, 최대 너비 설정
- **용도**: 동적 탭 시스템의 컨테이너

#### TabBar
- **경로**: `@/shared/components/tabs`
- **기능**: 탭 바
- **특징**: 탭 클릭/닫기 이벤트, 스크롤 가능
- **용도**: 탭 헤더 영역

#### TabContent
- **경로**: `@/shared/components/tabs`
- **기능**: 탭 콘텐츠
- **특징**: 지연 로딩, 캐시 관리
- **용도**: 탭별 콘텐츠 영역

---

### 🗺️ 전체 네비게이션 시스템 (2개)

#### NavigationMenu
- **경로**: `@/shared/components/navigation`
- **기능**: 동적 네비게이션 메뉴
- **특징**: RouteManager 메타데이터 기반 자동 생성, 권한 기반 표시, 계층형 구조, 아이콘 매핑
- **용도**: 사이드바 메뉴, 전체 네비게이션

#### Breadcrumb
- **경로**: `@/shared/components/navigation`
- **기능**: 전역 브레드크럼
- **특징**: 라우트 기반 자동 생성
- **용도**: 전체 앱의 브레드크럼 시스템

---

## 📊 카테고리별 통계

- **UI 컴포넌트**: 31개 (전체의 89%)
- **모달 컴포넌트**: 4개
- **탭 시스템**: 3개  
- **네비게이션 시스템**: 2개

## 🎯 특화 컴포넌트

### 금융/은행 특화
- **LedgerOrderSelect** - 원장계정 선택
- **LedgerOrdersHodSelect** - 책무번호 선택
- **CommonCodeSelect** - 공통코드 선택

### 대용량 데이터 처리
- **ServerDataGrid** - 서버 사이드 테이블
- **ServerFileUpload** - 서버 연동 파일 업로드

### 시스템 관리
- **NavigationMenu** - 동적 메뉴 생성
- **TabContainer** - 동적 탭 시스템
- **LoadingProvider** - 전역 로딩 관리

---

**총 컴포넌트 수**: 35개  
**마지막 업데이트**: 2025년 7월 23일