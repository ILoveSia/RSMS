# 🚀 ITCEN Solution

재사용 가능한 Web 프로젝트 개발환경

## ✨ 주요 특징

- **Modern Tech Stack**: React 19, Spring Boot 3.5, PostgreSQL 17.5
- **Type Safety**: TypeScript 전면 적용
- **Beautiful UI**: Material-UI v7 기반 모던 디자인
- **Developer Experience**: Hot Reload, 자동화된 설정
- **Production Ready**: Docker 지원, 확장 가능한 아키텍처

## 🛠 기술 스택

### Frontend
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버
- **Material-UI v7** - 모던 UI 컴포넌트
- **React Router v6** - 클라이언트 사이드 라우팅

### Backend
- **Spring Boot 3.5.0** - 최신 Spring 기능
- **Java 21** - 최신 LTS 버전
- **JPA/Hibernate** - ORM
- **Gradle** - 빌드 도구
- **PostgreSQL 17.5** - 메인 데이터베이스
- **Redis** - 캐싱 및 세션 관리

## 🚀 빠른 시작

### 1. 필수 요구사항
- Node.js v22.16.0+ ✅
- Java JDK 21+ ✅
- PostgreSQL v17.5 ✅

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
- **API 문서**: http://localhost:8080/swagger-ui.html

## 📁 프로젝트 구조

```
itcenSolution1/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # 재사용 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   ├── config/          # 환경 설정
│   │   └── theme/           # MUI 테마
│   └── package.json
├── backend/                  # Spring Boot Backend
│   ├── src/main/java/org/itcen/
│   │   ├── config/          # 설정 클래스
│   │   ├── common/          # 공통 유틸리티
│   │   └── domain/          # 도메인별 패키지
│   └── build.gradle
├── setup-local-db.ps1       # DB 설정 스크립트
└── package.json             # 루트 설정
```

## 💻 개발 명령어

```bash
# 개발 서버
npm run dev              # Frontend + Backend 동시 실행
npm run dev:frontend     # Frontend만 실행
npm run dev:backend      # Backend만 실행

# 빌드
npm run build           # 전체 빌드
npm run build:frontend  # Frontend 빌드
npm run build:backend   # Backend 빌드

# 테스트
npm run test            # 전체 테스트
npm run test:frontend   # Frontend 테스트
npm run test:backend    # Backend 테스트

# 데이터베이스
npm run db:start        # DB 서비스 시작
npm run db:stop         # DB 서비스 중지
npm run db:status       # DB 서비스 상태

# 유틸리티
npm run clean           # 빌드 파일 정리
npm run lint            # 코드 린트
npm run format          # 코드 포맷팅
```

## 🔧 환경 설정

### 데이터베이스 설정
```yaml
# PostgreSQL
Host: localhost
Port: 5432
Database: dev_db
Username: postgre
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

## 🏗 아키텍처

### Frontend 아키텍처
- **Component-Based**: 재사용 가능한 컴포넌트 구조
- **Type-Safe**: TypeScript로 타입 안정성 보장
- **Responsive**: 모바일 퍼스트 반응형 디자인
- **Theme System**: 다크/라이트 모드 지원

### Backend 아키텍처
- **Layered Architecture**: Controller → Service → Repository
- **Domain-Driven Design**: 도메인별 패키지 구조
- **RESTful API**: 표준 REST API 설계
- **Exception Handling**: 전역 예외 처리

## 📊 주요 기능

### 현재 구현된 기능
- ✅ 사용자 관리 시스템
- ✅ 대시보드 및 통계
- ✅ 반응형 UI/UX
- ✅ 다크/라이트 테마
- ✅ API 문서화
- ✅ 전역 예외 처리

### 계획된 기능
- 🔄 인증/인가 시스템
- 🔄 파일 업로드/다운로드
- 🔄 실시간 알림
- 🔄 다국어 지원
- 🔄 감사 로그

## 🧪 테스트

```bash
# Frontend 테스트
cd frontend
npm run test

# Backend 테스트
cd backend
./gradlew test

# API 테스트 (Postman Collection 제공)
```

## 📚 문서

- [개발환경 구축 가이드](./DEVELOPMENT_GUIDE.md)
- [API 문서](http://localhost:8080/swagger-ui.html)
- [컴포넌트 스토리북](./docs/storybook/)
- [데이터베이스 스키마](./docs/database/)

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