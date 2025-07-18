# 🚀 ITCEN Solution

**책무구조도 관리 시스템** - 금융회사 임원 책무 관리를 위한 엔터프라이즈급 웹 애플리케이션

## ✨ 주요 특징

- **Modern Tech Stack**: React 18.2, Spring Boot 3.5, PostgreSQL 17, Redis
- **Type Safety**: TypeScript 5.8.3 전면 적용
- **Beautiful UI**: Material-UI v5 기반 모던 디자인 시스템
- **Developer Experience**: Vite 5.0.12, Hot Reload, 자동화된 설정
- **Production Ready**: Docker 지원, 확장 가능한 아키텍처
- **Security**: Spring Security 6.x 기반 세션 인증/인가 시스템
- **Advanced UI**: 멀티 탭 시스템, 서버 사이드 데이터 그리드
- **Data Management**: Excel 내보내기, 파일 업로드/다운로드 지원
- **Performance**: 성능 최적화 및 메모이제이션 적용

## 🛠 기술 스택

### Frontend

- **React 18.2.0** - 최신 React 기능 활용
- **TypeScript 5.8.3** - 타입 안정성 보장
- **Vite 5.0.12** - 빠른 개발 서버 및 빌드
- **Material-UI v5.15.20** - 모던 UI 컴포넌트 라이브러리
- **React Router v6.26.0** - 클라이언트 사이드 라우팅
- **Redux Toolkit 2.8.2** - 상태 관리
- **Axios 1.9.0** - HTTP 클라이언트
- **MUI X DataGrid 7.7.1** - 서버 사이드 데이터 그리드
- **ExcelJS 4.4.0** - Excel 파일 처리
- **Day.js 1.11.13** - 날짜 처리 라이브러리

### Backend

- **Spring Boot 3.5.0** - 최신 Spring 기능
- **Java 21** - 최신 LTS 버전
- **Spring Data JPA** - ORM 및 데이터 액세스
- **Spring Security 6.x** - 인증/인가 시스템
- **Spring Session** - Redis 기반 세션 관리
- **Gradle 8.x** - 빌드 도구
- **PostgreSQL 17** - 메인 데이터베이스
- **Redis** - 캐싱 및 세션 저장소
- **Lombok** - 코드 간소화

### Infrastructure

- **Docker & Docker Compose** - 컨테이너화
- **Nginx** - 리버스 프록시 및 정적 파일 서빙
- **PostgreSQL 17** - 관계형 데이터베이스
- **Redis** - 인메모리 데이터 저장소

## 🚀 빠른 시작

### 1. 필수 요구사항

- Node.js v18.0.0+ ✅
- Java JDK 21+ ✅
- PostgreSQL v17+ ✅
- Redis ✅
- Docker (선택사항) ✅
- Git ✅

### 2. 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd itcenSolution1

# 데이터베이스 설정 (Windows - 관리자 권한 필요)
npm run setup:db

# 의존성 설치
npm run setup

# 개발 서버 실행
npm run dev
```

### 3. 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/actuator/health

## 📁 프로젝트 구조

```
itcenSolution1/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # 앱 레벨 컴포넌트
│   │   │   ├── config/         # 환경 설정
│   │   │   ├── router/         # 라우팅 설정
│   │   │   ├── services/       # API 서비스
│   │   │   ├── store/          # Redux 스토어
│   │   │   ├── theme/          # MUI 테마
│   │   │   ├── types/          # 글로벌 타입
│   │   │   └── utils/          # 유틸리티 함수
│   │   ├── domains/            # 도메인별 모듈
│   │   │   ├── main/           # 메인 대시보드
│   │   │   ├── login/          # 로그인 및 인증
│   │   │   ├── ledgermngt/     # 원장 관리
│   │   │   │   ├── api/        # API 클라이언트
│   │   │   │   ├── components/ # 도메인 컴포넌트
│   │   │   │   ├── pages/      # 페이지 컴포넌트
│   │   │   │   ├── hooks/      # 커스텀 훅
│   │   │   │   ├── store/      # 도메인 스토어
│   │   │   │   └── router/     # 도메인 라우팅
│   │   │   ├── inquiry/        # 조회 및 현황 관리
│   │   │   ├── cmplcheck/      # 컴플라이언스 체크
│   │   │   ├── meeting/        # 회의 관리
│   │   │   ├── menu/           # 메뉴 관리
│   │   │   └── common/         # 공통 코드 관리
│   │   └── shared/             # 공유 리소스
│   │       ├── components/     # 공통 컴포넌트
│   │       │   ├── ui/         # UI 컴포넌트 라이브러리
│   │       │   │   ├── data-display/ # 데이터 표시 컴포넌트
│   │       │   │   ├── feedback/     # 피드백 컴포넌트
│   │       │   │   ├── form/         # 폼 컴포넌트
│   │       │   │   ├── layout/       # 레이아웃 컴포넌트
│   │       │   │   └── navigation/   # 네비게이션 컴포넌트
│   │       │   ├── modal/      # 모달 컴포넌트
│   │       │   ├── tabs/       # 탭 시스템
│   │       │   └── layout/     # 레이아웃 컴포넌트
│   │       ├── hooks/          # 공통 훅
│   │       ├── context/        # React Context
│   │       ├── store/          # 공유 스토어
│   │       ├── types/          # 공통 타입
│   │       └── utils/          # 유틸리티 함수
│   └── package.json
├── backend/                     # Spring Boot Backend
│   ├── src/main/java/org/itcen/
│   │   ├── auth/               # 인증/인가 시스템
│   │   │   ├── config/         # 보안 설정
│   │   │   ├── controller/     # 인증 API
│   │   │   ├── domain/         # 인증 DTO
│   │   │   ├── filter/         # 보안 필터
│   │   │   ├── handler/        # 인증 핸들러
│   │   │   ├── repository/     # 인증 데이터 액세스
│   │   │   ├── service/        # 인증 비즈니스 로직
│   │   │   └── session/        # 세션 관리
│   │   ├── common/             # 공통 유틸리티
│   │   │   ├── dto/            # 공통 DTO
│   │   │   ├── entity/         # 공통 엔티티
│   │   │   └── exception/      # 예외 처리
│   │   ├── config/             # 전역 설정
│   │   └── domain/             # 비즈니스 도메인
│   │       ├── casestudy/      # 케이스 스터디
│   │       ├── common/         # 공통 코드
│   │       ├── departments/    # 부서 관리
│   │       ├── meeting/        # 회의 관리
│   │       ├── menu/           # 메뉴 관리
│   │       ├── positions/      # 포지션 관리
│   │       ├── qna/            # Q&A 시스템
│   │       ├── responsibility/ # 책임 관리
│   │       └── user/           # 사용자 관리
│   ├── database/init/          # DB 초기화 스크립트
│   └── build.gradle
├── docker-compose.yml          # Docker 설정
├── docker-compose.dev.yml      # 개발용 Docker 설정
└── package.json                # 루트 설정
```

## 💻 개발 명령어

```bash
# 개발 서버
npm run dev              # Frontend + Backend 동시 실행
npm run dev:frontend     # Frontend만 실행 (localhost:3000)
npm run dev:backend      # Backend만 실행 (localhost:8080)
npm run dev:local        # DB 설정 + 전체 실행
npm run dev:db           # DB 서비스만 시작
npm run dev:full         # Docker로 전체 스택 실행

# 빌드
npm run build           # 전체 빌드
npm run build:frontend  # Frontend 빌드
npm run build:backend   # Backend 빌드

# 테스트
npm run test            # 전체 테스트
npm run test:frontend   # Frontend 테스트
npm run test:backend    # Backend 테스트

# 데이터베이스 관리
npm run db:start        # DB 서비스 시작
npm run db:stop         # DB 서비스 중지
npm run db:restart      # DB 서비스 재시작
npm run db:status       # DB 서비스 상태

# Docker 관리
npm run docker:build    # Docker 이미지 빌드
npm run docker:up       # Docker 컨테이너 시작
npm run docker:down     # Docker 컨테이너 중지
npm run docker:logs     # Docker 로그 확인

# 유틸리티
npm run clean           # 빌드 파일 정리
npm run lint            # 코드 린트
npm run format          # 코드 포맷팅
npm run setup           # 전체 의존성 설치
npm run setup:local     # 로컬 환경 전체 설정
```

## 🔧 환경 설정

### 데이터베이스 설정

```yaml
# PostgreSQL
Host: localhost
Port: 5432
Database: dev_db
Username: postgres
Password: 1q2w3e4r!

# Redis
Host: localhost
Port: 6379
```

### 환경 변수 (Frontend)

```bash
VITE_APP_TITLE=ITCEN Solution
VITE_API_BASE_URL=http://localhost:8080
VITE_LOG_LEVEL=debug
```

### 백엔드 프로파일

- **local**: 로컬 개발환경 (기본값)
- **docker**: Docker 환경
- **prod**: 운영 환경

## 🏗 아키텍처

### Frontend 아키텍처

- **Domain-Driven Design**: 도메인별 모듈 구조
- **Component-Based**: 재사용 가능한 컴포넌트 구조
- **Type-Safe**: TypeScript로 타입 안정성 보장
- **Responsive**: 모바일 퍼스트 반응형 디자인
- **State Management**: Redux Toolkit 기반 상태 관리
- **Performance**: React.memo, useMemo, useCallback 최적화
- **Modular Routing**: 도메인별 라우트 관리

### Backend 아키텍처

- **Layered Architecture**: Controller → Service → Repository
- **Domain-Driven Design**: 도메인별 패키지 구조
- **RESTful API**: 표준 REST API 설계
- **Security**: Spring Security 6.x 기반 인증/인가
- **Session Management**: Redis 기반 세션 관리
- **Exception Handling**: 전역 예외 처리
- **JPA Auditing**: 자동 생성/수정 정보 관리

## 📊 주요 기능

### 🎯 핵심 비즈니스 기능

- ✅ **책무구조도 관리**: 임원 책무 및 구조도 관리
- ✅ **메인 대시보드**: Q&A, Case Study, 업무 현황 통합 대시보드
- ✅ **인증/인가 시스템**: Spring Security 기반 세션 인증
- ✅ **사용자 관리**: 사용자 등록, 수정, 조회, 권한 관리
- ✅ **메뉴 관리**: 동적 메뉴 시스템 및 권한 기반 접근 제어
- ✅ **케이스 스터디**: 사례 연구 관리 및 검색
- ✅ **회의 관리**: 회의체 정보 및 운영 관리
- ✅ **포지션 관리**: 직책, 소관부서, 회의체 매핑 관리
- ✅ **Q&A 시스템**: 질문/답변 관리, 파일 첨부, 상태 관리
- ✅ **책임 관리**: 업무 책임 및 관련 근거 관리
- ✅ **공통 코드**: 시스템 공통 코드 관리 및 그룹별 분류
- ✅ **부서 관리**: 조직 부서 정보 관리
- ✅ **컴플라이언스**: 검토 계획 관리
- ✅ **조회 시스템**: 부서별 현황, 월별 현황, 검사 일정 조회

### 🎨 UI/UX 기능

- ✅ **멀티 탭 시스템**: 동적 탭 생성 및 관리로 향상된 UX
- ✅ **서버 사이드 데이터 그리드**: 페이지네이션, 정렬, 검색 지원
- ✅ **반응형 디자인**: Material-UI 기반 모바일 우선 설계
- ✅ **다크/라이트 테마**: 테마 토글 기능
- ✅ **브레드크럼 네비게이션**: 현재 위치 표시
- ✅ **모달 및 다이얼로그**: 일관된 모달 시스템
- ✅ **알림 시스템**: 토스트 및 알림 메시지
- ✅ **로딩 상태**: 전역 로딩 상태 관리

### 🔧 기술적 특징

- ⚡ **성능 최적화**: React.memo, useMemo, useCallback 적용
- 🔄 **세션 기반 인증**: Redis를 통한 세션 관리
- 📁 **파일 업로드/다운로드**: Q&A 첨부파일 지원
- 📊 **Excel 내보내기**: ExcelJS 기반 XLSX 지원
- 🎯 **타입 안전성**: TypeScript 엄격 모드 적용
- 🧩 **컴포넌트 재사용**: 공통 컴포넌트 라이브러리
- 📡 **API 문서화**: Spring Boot Actuator 기반 모니터링
- 🔍 **전역 예외 처리**: 표준화된 에러 응답

## 🧪 테스트

```bash
# Frontend 테스트
cd frontend
npm run test

# Backend 테스트
cd backend
./gradlew test

# 통합 테스트
npm run test
```

## 📚 API 문서

### 주요 엔드포인트

- **Auth**: `/api/auth/**` - 인증/인가 (로그인, 로그아웃, 회원가입)
- **Users**: `/api/users/**` - 사용자 관리
- **Menus**: `/api/menus/**` - 메뉴 관리
- **Case Studies**: `/api/case-studies/**` - 케이스 스터디
- **Meetings**: `/api/meeting-bodies/**` - 회의 관리
- **Positions**: `/api/positions/**` - 포지션 관리
- **QnA**: `/api/qna/**` - Q&A 시스템
- **Responsibilities**: `/api/responsibilities/**` - 책임 관리
- **Common Codes**: `/api/common-codes/**` - 공통 코드
- **Departments**: `/api/departments/**` - 부서 관리
- **Inquiry**: `/api/inquiry/**` - 조회 및 현황 관리

### 모니터링 엔드포인트

- **Health**: `/api/actuator/health` - 애플리케이션 상태
- **Info**: `/api/actuator/info` - 애플리케이션 정보
- **Metrics**: `/api/actuator/metrics` - 성능 메트릭

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

- 📧 Email: support@itcen.com
- 💬 Slack: #itcen-solution
- 📖 Wiki: [프로젝트 위키](./wiki/)

---

## 📋 최신 업데이트 (2025.01)

### 🆕 새로운 기능

- **책무구조도 메인 대시보드**: 통합 대시보드 구현
- **서버 사이드 데이터 그리드**: 고성능 데이터 그리드 시스템
- **멀티 탭 시스템**: 동적 탭 생성 및 관리 기능
- **Excel 내보내기**: ExcelJS 기반 데이터 내보내기 기능
- **파일 관리**: 업로드/다운로드 시스템 구현
- **날짜 포맷팅**: 일관된 날짜 표시 시스템

### 🔧 기술적 개선사항

- **성능 최적화**: React.memo, useMemo, useCallback 적용
- **타입 안전성**: TypeScript 5.8.3 엄격 모드 적용
- **컴포넌트 시스템**: 재사용 가능한 UI 컴포넌트 라이브러리
- **상태 관리**: Redux Toolkit 기반 효율적 상태 관리
- **에러 처리**: 전역 에러 핸들링 시스템
- **코드 품질**: ESLint, Prettier 적용

### 🚀 성능 최적화

- **메모이제이션**: 컴포넌트 및 함수 최적화
- **코드 스플리팅**: React.lazy를 통한 동적 로딩
- **번들 최적화**: Vite 5.0.12 기반 빠른 빌드
- **서버 사이드 페이지네이션**: 대용량 데이터 처리
- **캐싱**: Redis 기반 세션 및 데이터 캐싱

### 📱 사용자 경험

- **반응형 디자인**: 모바일 우선 설계
- **직관적 네비게이션**: 브레드크럼 및 탭 시스템
- **일관된 UI**: Material-UI 기반 디자인 시스템
- **접근성**: 웹 접근성 가이드라인 준수
- **로딩 상태**: 사용자 피드백 시스템

---

**Made with ❤️ by ITCEN Team**
