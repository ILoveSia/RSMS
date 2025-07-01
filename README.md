# 🚀 ITCEN Solution

재사용 가능한 Web 프로젝트 개발환경

## ✨ 주요 특징

- **Modern Tech Stack**: React 18, Spring Boot 3.5, PostgreSQL 17, Redis
- **Type Safety**: TypeScript 전면 적용
- **Beautiful UI**: Material-UI v5 기반 모던 디자인
- **Developer Experience**: Hot Reload, 자동화된 설정
- **Production Ready**: Docker 지원, 확장 가능한 아키텍처
- **Security**: Spring Security 기반 인증/인가 시스템

## 🛠 기술 스택

### Frontend
- **React 18.2** - 최신 React 기능 활용
- **TypeScript** - 타입 안정성
- **Vite 6** - 빠른 개발 서버
- **Material-UI v5** - 모던 UI 컴포넌트
- **React Router v7** - 클라이언트 사이드 라우팅
- **Redux Toolkit** - 상태 관리
- **Axios** - HTTP 클라이언트

### Backend
- **Spring Boot 3.5.0** - 최신 Spring 기능
- **Java 21** - 최신 LTS 버전
- **Spring Data JPA** - ORM
- **Spring Security** - 인증/인가
- **Spring Session** - 세션 관리
- **Gradle** - 빌드 도구
- **PostgreSQL 17** - 메인 데이터베이스
- **Redis** - 캐싱 및 세션 저장소
- **Lombok** - 코드 간소화

## 🚀 빠른 시작

### 1. 필수 요구사항
- Node.js v22.16.0+ ✅
- Java JDK 21+ ✅
- PostgreSQL v17+ ✅
- Redis ✅

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
│   │   │   ├── components/     # 공통 컴포넌트
│   │   │   ├── router/         # 라우팅 설정
│   │   │   ├── services/       # API 서비스
│   │   │   ├── store/          # Redux 스토어
│   │   │   └── theme/          # MUI 테마
│   │   ├── domains/            # 도메인별 모듈
│   │   │   ├── cmplcheck/      # 컴플라이언스 체크
│   │   │   ├── ledgermngt/     # 원장 관리
│   │   │   ├── login/          # 로그인
│   │   │   ├── main/           # 메인 페이지
│   │   │   └── menu/           # 메뉴 관리
│   │   └── shared/             # 공유 컴포넌트
│   └── package.json
├── backend/                     # Spring Boot Backend
│   ├── src/main/java/org/itcen/
│   │   ├── auth/               # 인증/인가
│   │   ├── common/             # 공통 유틸리티
│   │   ├── config/             # 설정 클래스
│   │   └── domain/             # 도메인별 패키지
│   │       ├── casestudy/      # 케이스 스터디
│   │       ├── common/         # 공통 코드
│   │       ├── meeting/        # 회의 관리
│   │       ├── menu/           # 메뉴 관리
│   │       ├── positions/      # 포지션 관리
│   │       ├── qna/            # Q&A
│   │       ├── responsibility/ # 책임 관리
│   │       └── user/           # 사용자 관리
│   ├── database/init/          # DB 초기화 스크립트
│   └── build.gradle
├── docker-compose.yml          # Docker 설정
├── setup-local-db.ps1          # DB 설정 스크립트
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

### Backend 아키텍처
- **Layered Architecture**: Controller → Service → Repository
- **Domain-Driven Design**: 도메인별 패키지 구조
- **RESTful API**: 표준 REST API 설계
- **Security**: Spring Security 기반 인증/인가
- **Exception Handling**: 전역 예외 처리
- **Session Management**: Redis 기반 세션 관리

## 📊 주요 기능

### 현재 구현된 기능
- ✅ **인증/인가 시스템**: Spring Security 기반
- ✅ **사용자 관리**: 사용자 등록, 수정, 조회
- ✅ **메뉴 관리**: 동적 메뉴 시스템
- ✅ **케이스 스터디**: 케이스 관리 시스템
- ✅ **회의 관리**: 회의체 관리
- ✅ **포지션 관리**: 포지션 및 원장 관리
- ✅ **Q&A 시스템**: 질문/답변 관리, 파일 첨부
- ✅ **책임 관리**: 업무 책임 관리
- ✅ **공통 코드**: 시스템 공통 코드 관리
- ✅ **컴플라이언스**: 검토 계획 관리
- ✅ **반응형 UI/UX**: Material-UI 기반
- ✅ **API 문서화**: Spring Boot Actuator
- ✅ **전역 예외 처리**: 표준화된 에러 응답

### 기술적 특징
- 🔄 **세션 기반 인증**: Redis를 통한 세션 관리
- 🔄 **파일 업로드/다운로드**: Q&A 첨부파일 지원
- 🔄 **데이터 그리드**: MUI X DataGrid 활용
- 🔄 **Excel 내보내기**: XLSX 지원
- 🔄 **모니터링**: Actuator 기반 헬스체크

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
- **Auth**: `/api/auth/**` - 인증/인가
- **Users**: `/api/users/**` - 사용자 관리
- **Menus**: `/api/menus/**` - 메뉴 관리
- **Case Studies**: `/api/case-studies/**` - 케이스 스터디
- **Meetings**: `/api/meeting-bodies/**` - 회의 관리
- **Positions**: `/api/positions/**` - 포지션 관리
- **QnA**: `/api/qna/**` - Q&A 시스템
- **Responsibilities**: `/api/responsibilities/**` - 책임 관리
- **Common Codes**: `/api/common-codes/**` - 공통 코드

### 모니터링 엔드포인트
- **Health**: `/api/actuator/health`
- **Info**: `/api/actuator/info`
- **Metrics**: `/api/actuator/metrics`

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

**Made with ❤️ by ITCEN Team** 