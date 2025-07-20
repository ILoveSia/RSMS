# 🐳 ITCEN Solution Docker 설정 가이드

**책무구조도 관리 시스템**을 위한 완전한 Docker 컨테이너화 가이드입니다. 개발 및 운영 환경을 손쉽게 구성할 수 있습니다.

## 📋 사전 요구사항

- **Docker Desktop** (Windows/Mac) 또는 **Docker Engine** (Linux) v20.10+
- **Docker Compose** v2.x 이상 (v3.8+ compose file format)
- **메모리**: 최소 4GB RAM (권장 8GB+)
- **디스크**: 최소 10GB 여유 공간
- **네트워크**: 인터넷 연결 (이미지 다운로드용)

## 🏗 프로젝트 구조

```
itcenSolution1/
├── docker-compose.yml          # 🚀 운영환경용 컴포즈 파일
├── docker-compose.dev.yml      # 🛠 개발환경용 컴포즈 파일
├── .claude.json               # 🤖 Claude Code MCP 설정
├── backend/
│   ├── Dockerfile              # 🐳 운영용 백엔드 Dockerfile
│   ├── Dockerfile.dev          # 🔧 개발용 백엔드 Dockerfile
│   └── database/init/          # 📄 DB 초기화 스크립트
└── frontend/
    ├── Dockerfile              # 🐳 운영용 프론트엔드 Dockerfile
    ├── Dockerfile.dev          # 🔧 개발용 프론트엔드 Dockerfile
    └── nginx.conf              # ⚙️ 프론트엔드 Nginx 설정
```

## 🔧 서비스 구성

### 📦 공통 서비스
- **PostgreSQL 17.5**: 메인 데이터베이스 (포트 5432)
- **Redis 7.4**: 세션 저장소 및 캐시 (포트 6379)
- **Spring Boot 3.5**: 백엔드 API 서버 (포트 8080)
- **React 18.2 + Vite 5.0**: 프론트엔드 웹 애플리케이션 (포트 3000)

### 🚀 운영 환경 전용
- **Nginx**: 리버스 프록시 (포트 80, 선택사항)
- **Health Checks**: 자동 상태 모니터링
- **Volume Persistence**: 데이터 영속성 보장

### 🛠 개발 환경 추가 기능
- **Hot Reload**: 코드 변경 시 자동 재시작
- **Debug Port**: Java 원격 디버깅 (포트 5005)
- **Volume Mounts**: 실시간 코드 동기화

## 🚀 사용법

### 1. 🛠 개발 환경 실행

개발 환경에서는 **Hot Reload**, **실시간 디버깅**, **코드 동기화**가 지원됩니다.

```bash
# 📦 개발 환경 시작 (백그라운드)
docker-compose -f docker-compose.dev.yml up -d

# 📋 실시간 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 🛑 개발 환경 종료
docker-compose -f docker-compose.dev.yml down

# 🗑 볼륨까지 완전 삭제 (주의!)
docker-compose -f docker-compose.dev.yml down -v
```

**📊 개발 환경 특징:**
- 🌐 **Frontend**: http://localhost:3000 (Vite Hot Reload)
- 🔧 **Backend**: http://localhost:8080 (Spring Boot DevTools)
- 🐛 **Debug Port**: localhost:5005 (IntelliJ/VSCode 연결)
- 💾 **Database**: `dev_db` (개발 전용)
- 🔄 **자동 재시작**: 코드 변경 시 실시간 반영
- 📁 **Volume Mount**: 로컬 코드와 컨테이너 동기화

### 2. 🚀 운영 환경 실행

```bash
# 🏭 운영 환경 시작 (백그라운드)
docker-compose up -d

# 📋 로그 모니터링
docker-compose logs -f

# 🛑 운영 환경 종료
docker-compose down

# 🔄 이미지 재빌드 후 시작
docker-compose up -d --build
```

**🏭 운영 환경 특징:**
- ⚡ **최적화된 빌드**: Multi-stage Docker build
- 🚀 **프로덕션 모드**: 성능 최적화된 실행
- 🏥 **Health Checks**: 자동 상태 모니터링 및 재시작
- 💾 **Database**: `postgres` (운영 DB)
- 🔒 **보안 강화**: 최소 권한 실행
- 📊 **모니터링**: Actuator 엔드포인트 활성화

### 3. 🌐 Nginx 리버스 프록시 사용 (운영환경)

```bash
# 🔄 Nginx 포함하여 실행
docker-compose --profile prod up -d

# 🌍 접속: http://localhost (포트 80)
# 🏥 헬스체크: http://localhost/health
```

**🌐 Nginx 프록시 특징:**
- 🚀 **로드 밸런싱**: 트래픽 분산 처리
- 🔒 **SSL 종료**: HTTPS 인증서 관리 (설정 시)
- 📈 **성능 향상**: 정적 파일 캐싱 및 압축
- 🛡 **보안 강화**: Rate limiting 및 DDoS 방어

## 🌐 포트 정보

### 🛠 개발 환경
| 서비스 | URL | 포트 | 비고 |
|--------|-----|------|------|
| 🌐 Frontend | http://localhost:3000 | 3000 | Vite Dev Server |
| 🔧 Backend API | http://localhost:8080/api | 8080 | Spring Boot |
| 🐛 Debug Port | localhost:5005 | 5005 | Java Remote Debug |
| 💾 PostgreSQL | localhost:5432 | 5432 | DB 접속 |
| 🗃 Redis | localhost:6379 | 6379 | 세션/캐시 |

### 🚀 운영 환경
| 서비스 | URL | 포트 | 비고 |
|--------|-----|------|------|
| 🌐 Frontend | http://localhost:3000 | 3000 | 빌드된 React 앱 |
| 🔧 Backend API | http://localhost:8080/api | 8080 | 운영 모드 |
| 💾 PostgreSQL | localhost:5432 | 5432 | 운영 DB |
| 🗃 Redis | localhost:6379 | 6379 | 세션/캐시 |
| 🌍 Nginx (옵션) | http://localhost | 80 | 리버스 프록시 |

## 데이터베이스 설정

### 연결 정보
- **Host**: localhost (로컬에서 접근 시) 또는 postgres (컨테이너 내부)
- **Port**: 5432
- **Database**:
  - 개발환경: `dev_db`
  - 운영환경: `postgres`
- **Username**: postgres
- **Password**: 1q2w3e4r!

### 초기화 스크립트
데이터베이스 초기화 스크립트는 `backend/database/init/` 디렉토리에 위치하며, 컨테이너 시작 시 자동으로 실행됩니다.

## 개발 팁

### 백엔드 디버깅
```bash
# IntelliJ IDEA에서 Remote JVM Debug 설정
# Host: localhost
# Port: 5005
```

### 컨테이너 재빌드
```bash
# 개발환경 재빌드
docker-compose -f docker-compose.dev.yml build --no-cache

# 운영환경 재빌드
docker-compose build --no-cache
```

### 특정 서비스만 실행
```bash
# PostgreSQL과 Redis만 실행 (로컬 개발 시)
docker-compose up postgres redis -d
```

### 로그 모니터링
```bash
# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend

# 실시간 로그 스트리밍
docker-compose -f docker-compose.dev.yml logs -f --tail=100
```

## 볼륨 관리

### 데이터 백업
```bash
# PostgreSQL 데이터 백업
docker exec itcen-postgres pg_dump -U postgres postgres > backup.sql

# 볼륨 백업
docker run --rm -v itcensolution1_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### 데이터 초기화
```bash
# 개발 환경 데이터 초기화
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# 운영 환경 데이터 초기화 (주의!)
docker-compose down -v
docker-compose up -d
```

## 문제 해결
1
### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 포트 사용 확인
   netstat -tlnp | grep :8080
   netstat -tlnp | grep :3000
   ```

2. **권한 문제 (Linux/Mac)**
   ```bash
   # Docker 그룹에 사용자 추가
   sudo usermod -aG docker $USER
   # 로그아웃 후 재로그인 필요
   ```

3. **메모리 부족**
   ```bash
   # Docker Desktop에서 메모리 할당 증가 (최소 4GB 권장)
   ```

4. **빌드 실패**
   ```bash
   # Docker 캐시 정리
   docker system prune -a

   # 빌드 캐시 없이 재빌드
   docker-compose build --no-cache
   ```

## 📊 모니터링 & 헬스체크

### 🏥 헬스체크
```bash
# 🔧 백엔드 애플리케이션 상태
curl http://localhost:8080/api/actuator/health

# 💾 데이터베이스 연결 상태
curl http://localhost:8080/api/actuator/health/db

# 🗃 Redis 연결 상태
curl http://localhost:8080/api/actuator/health/redis

# 🌐 프론트엔드 상태 (개발환경)
curl http://localhost:3000
```

### 📈 메트릭스 & 모니터링
```bash
# 📊 애플리케이션 메트릭스
curl http://localhost:8080/api/actuator/metrics

# 📉 Prometheus 메트릭스 (운영환경)
curl http://localhost:8080/api/actuator/prometheus

# 💻 JVM 정보
curl http://localhost:8080/api/actuator/info

# 🌐 환경 정보
curl http://localhost:8080/api/actuator/env
```

### 🔍 로그 모니터링
```bash
# 📋 모든 서비스 로그 실시간 확인
docker-compose logs -f

# 🔧 특정 서비스 로그만 확인
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# 📊 로그 통계 (최근 100라인)
docker-compose logs --tail=100 backend
```

## 🚨 보안 고려사항

### 🔒 운영 환경 보안
```bash
# 🔐 환경 변수 암호화 (권장)
echo "DB_PASSWORD=your_secure_password" > .env
docker-compose --env-file .env up -d

# 🛡 컨테이너 보안 스캔
docker scan itcen-backend:latest
docker scan itcen-frontend:latest
```

### 📋 보안 체크리스트
- ✅ **기본 패스워드 변경**: PostgreSQL, Redis 패스워드 변경
- ✅ **환경 변수 분리**: `.env` 파일로 민감 정보 관리
- ✅ **네트워크 격리**: 내부 Docker 네트워크 사용
- ✅ **포트 제한**: 필요한 포트만 외부 노출
- ✅ **이미지 업데이트**: 정기적인 베이스 이미지 업데이트
- ✅ **로그 관리**: 민감 정보 로깅 방지

---

## 📚 추가 정보 & 참고 자료

### 🔗 공식 문서
- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 레퍼런스](https://docs.docker.com/compose/)
- [Spring Boot Docker 가이드](https://spring.io/guides/gs/spring-boot-docker/)
- [Vite Docker 설정](https://vitejs.dev/guide/build.html#docker)

### 🤖 AI 개발 환경
- [Claude Code 공식 문서](https://docs.anthropic.com/en/docs/claude-code)
- [MCP 프로토콜 가이드](https://modelcontextprotocol.io/)
- [SuperClaude 프레임워크](https://github.com/anthropics/claude-code)

### 🛠 개발 도구
- [PostgreSQL 17 문서](https://www.postgresql.org/docs/17/)
- [Redis 7.4 문서](https://redis.io/docs/)
- [Spring Boot 3.5 가이드](https://spring.io/projects/spring-boot)
- [React 18.2 문서](https://react.dev/)

---

**🐳 Made with Docker & ❤️ by ITCEN Team**
