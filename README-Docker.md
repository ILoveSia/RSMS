# ITCEN Solution Docker 설정

이 프로젝트는 Docker와 Docker Compose를 사용하여 개발 및 운영 환경을 구성할 수 있습니다.

## 사전 요구사항

- Docker Desktop (Windows/Mac) 또는 Docker Engine (Linux)
- Docker Compose v3.8 이상

## 프로젝트 구조

```
itcenSolution1/
├── docker-compose.yml          # 운영환경용 컴포즈 파일
├── docker-compose.dev.yml      # 개발환경용 컴포즈 파일
├── backend/
│   ├── Dockerfile              # 운영용 백엔드 Dockerfile
│   └── Dockerfile.dev          # 개발용 백엔드 Dockerfile
└── frontend/
    ├── Dockerfile              # 운영용 프론트엔드 Dockerfile
    ├── Dockerfile.dev          # 개발용 프론트엔드 Dockerfile
    └── nginx.conf              # 프론트엔드 Nginx 설정
```

## 서비스 구성

### 공통 서비스
- **PostgreSQL 17.5**: 메인 데이터베이스
- **Redis 7.4**: 세션 저장소 및 캐시
- **Spring Boot**: 백엔드 API 서버
- **React + Vite**: 프론트엔드 웹 애플리케이션

### 운영 환경 전용
- **Nginx**: 리버스 프록시 (선택사항)

## 사용법

### 1. 개발 환경 실행

개발 환경에서는 핫 리로딩과 디버깅이 지원됩니다.

```bash
# 개발 환경 시작
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 개발 환경 종료
docker-compose -f docker-compose.dev.yml down
```

**개발 환경 특징:**
- 백엔드: 포트 8080 (애플리케이션) + 5005 (디버그)
- 프론트엔드: 포트 3000
- 소스 코드 변경 시 자동 재시작/재빌드
- 데이터베이스: `dev_db`

### 2. 운영 환경 실행

```bash
# 운영 환경 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 운영 환경 종료
docker-compose down
```

**운영 환경 특징:**
- 최적화된 빌드 이미지 사용
- 프로덕션 모드로 실행
- 헬스체크 포함
- 데이터베이스: `postgres`

### 3. Nginx 리버스 프록시 사용 (운영환경)

```bash
# Nginx 포함하여 실행
docker-compose --profile prod up -d

# 이후 http://localhost 접속 가능
```

## 포트 정보

### 개발 환경
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Backend Debug: localhost:5005
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 운영 환경
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Nginx (선택): http://localhost:80

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

## 모니터링

### 헬스체크
```bash
# 백엔드 헬스체크
curl http://localhost:8080/api/actuator/health

# 프론트엔드 헬스체크
curl http://localhost:3000/health
```

### 메트릭스
```bash
# 백엔드 메트릭스
curl http://localhost:8080/api/actuator/metrics

# Prometheus 메트릭스
curl http://localhost:8080/api/actuator/prometheus
```

---

## 추가 정보

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 레퍼런스](https://docs.docker.com/compose/)
- [Spring Boot Docker 가이드](https://spring.io/guides/gs/spring-boot-docker/)
- [Vite Docker 설정](https://vitejs.dev/guide/build.html#docker) 