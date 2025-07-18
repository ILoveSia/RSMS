# 책무DB현황관리 서비스 설계서

## 1. 서비스 개요

### 1.1 서비스 목적

책무 및 책무 세부내용을 체계적으로 통합 관리하는 RESTful API 서비스를 제공한다. 책무의 기본정보와 관련된 세부내용을 1:N 관계로 관리하며, 세부내용의 동적 추가/삭제, 변경이력 추적, Excel 내보내기 등의 종합적인 책무 관리 기능을 제공한다.

### 1.2 서비스 범위

- 책무 CRUD (생성, 조회, 수정, 삭제) 기능
- 책무 세부내용 동적 관리 (1:N 관계)
- 다중 조건 검색 (책무번호, 책무ID)
- 책무 현황 목록 조회 (1:N 관계 플랫 구조)
- 변경이력 조회 및 추적
- 일괄 삭제 기능
- Excel 내보내기 기능

### 1.3 서비스 특성

- **서비스명**: ResponsibilityService
- **서비스 유형**: 1:N 관계 통합 관리 서비스 (One-to-Many Management)
- **응답 시간**: 평균 3초 이내
- **가용성**: 99.9% 이상
- **동시 사용자**: 최대 100명
- **관리 테이블**: 2개 (responsibility, responsibility_detail)

## 2. API 명세

### 2.1 책무 생성 API

#### 2.1.1 기본 정보

- **URL**: `/api/responsibilities`
- **Method**: POST
- **Content-Type**: application/json
- **인증**: Bearer Token 필수

#### 2.1.2 요청 명세

##### Request Body

```json
{
  "responsibilityContent": "위험관리 책무",
  "details": [
    {
      "responsibilityDetailContent": "위험 평가 및 분석",
      "keyManagementTasks": "정기적인 위험 점검",
      "relatedBasis": "위험관리규정 제3조"
    },
    {
      "responsibilityDetailContent": "위험 대응 계획 수립",
      "keyManagementTasks": "위험 대응 방안 마련",
      "relatedBasis": "위험관리규정 제4조"
    }
  ]
}
```

| 필드명                      | 타입                          | 필수 | 설명                          | 제약조건 |
| --------------------------- | ----------------------------- | ---- | ----------------------------- | -------- |
| responsibilityContent       | String                        | Y    | 책무 내용                     | TEXT     |
| details                     | List<ResponsibilityDetailDto> | N    | 책무 세부내용 목록            | -        |
| responsibilityDetailContent | String                        | N    | 책무 세부내용                 | TEXT     |
| keyManagementTasks          | String                        | N    | 책무이행을 위한 주요 관리업무 | TEXT     |
| relatedBasis                | String                        | N    | 관련 근거                     | TEXT     |

##### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "책무가 성공적으로 생성되었습니다.",
  "data": 1001
}
```

### 2.2 책무 수정 API

#### 2.2.1 기본 정보

- **URL**: `/api/responsibilities/{id}`
- **Method**: PUT
- **Content-Type**: application/json

#### 2.2.2 요청 명세

##### Path Parameters

| 파라미터명 | 타입 | 필수 | 설명                |
| ---------- | ---- | ---- | ------------------- |
| id         | Long | Y    | 책무 ID (BIGSERIAL) |

##### Request Body

```json
{
  "responsibilityContent": "품질관리 책무",
  "details": [
    {
      "responsibilityDetailContent": "품질 검사 및 관리",
      "keyManagementTasks": "정기 품질 점검",
      "relatedBasis": "품질관리규정 제2조"
    }
  ]
}
```

##### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "책무가 성공적으로 수정되었습니다.",
  "data": 1001
}
```

### 2.3 책무 삭제 API

#### 2.3.1 기본 정보

- **URL**: `/api/responsibilities/{id}`
- **Method**: DELETE

#### 2.3.2 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "책무가 성공적으로 삭제되었습니다."
}
```

### 2.4 책무 상세 조회 API

#### 2.4.1 기본 정보

- **URL**: `/api/responsibilities/{id}`
- **Method**: GET

#### 2.4.2 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "책무 조회가 완료되었습니다.",
  "data": {
    "id": 1001,
    "responsibilityContent": "위험관리 책무",
    "details": [
      {
        "id": 2001,
        "responsibilityDetailContent": "위험 평가 및 분석",
        "keyManagementTasks": "정기적인 위험 점검",
        "relatedBasis": "위험관리규정 제3조"
      },
      {
        "id": 2002,
        "responsibilityDetailContent": "위험 대응 계획 수립",
        "keyManagementTasks": "위험 대응 방안 마련",
        "relatedBasis": "위험관리규정 제4조"
      }
    ]
  }
}
```

### 2.5 책무 현황 목록 조회 API

#### 2.5.1 기본 정보

- **URL**: `/api/responsibilities/status`
- **Method**: GET

#### 2.5.2 요청 명세

##### Query Parameters

| 파라미터명       | 타입 | 필수 | 설명                  | 기본값 |
| ---------------- | ---- | ---- | --------------------- | ------ |
| responsibilityId | Long | N    | 특정 책무 ID로 필터링 | -      |

#### 2.5.3 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "책무 현황 조회가 완료되었습니다.",
  "data": [
    {
      "responsibilityId": 1001,
      "responsibilityContent": "위험관리 책무",
      "responsibilityDetailId": 2001,
      "responsibilityDetailContent": "위험 평가 및 분석",
      "responsibilityMgtSts": "정기적인 위험 점검",
      "responsibilityRelEvid": "위험관리규정 제3조",
      "createdAt": "2024-12-19T14:30:00.000Z",
      "updatedAt": "2024-12-19T14:30:00.000Z"
    },
    {
      "responsibilityId": 1001,
      "responsibilityContent": "위험관리 책무",
      "responsibilityDetailId": 2002,
      "responsibilityDetailContent": "위험 대응 계획 수립",
      "responsibilityMgtSts": "위험 대응 방안 마련",
      "responsibilityRelEvid": "위험관리규정 제4조",
      "createdAt": "2024-12-19T14:30:00.000Z",
      "updatedAt": "2024-12-19T14:30:00.000Z"
    }
  ]
}
```

### 2.6 책무 검색 API

#### 2.6.1 기본 정보

- **URL**: `/api/responsibilities/search`
- **Method**: GET

#### 2.6.2 요청 명세

##### Query Parameters

| 파라미터명       | 타입    | 필수 | 설명                     | 기본값 |
| ---------------- | ------- | ---- | ------------------------ | ------ |
| ledgerOrder      | String  | N    | 원장차수 코드            | -      |
| responsibilityId | Long    | N    | 책무 ID                  | -      |
| page             | Integer | N    | 페이지 번호 (0부터 시작) | 0      |
| size             | Integer | N    | 페이지 크기              | 100    |

#### 2.6.3 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "책무 검색이 완료되었습니다.",
  "data": {
    "content": [
      {
        "responsibilityId": 1001,
        "responsibilityContent": "위험관리 책무",
        "responsibilityDetailId": 2001,
        "responsibilityDetailContent": "위험 평가 및 분석",
        "responsibilityMgtSts": "정기적인 위험 점검",
        "responsibilityRelEvid": "위험관리규정 제3조",
        "createdAt": "2024-12-19T14:30:00.000Z",
        "updatedAt": "2024-12-19T14:30:00.000Z"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 100
    },
    "totalElements": 150,
    "totalPages": 2,
    "first": true,
    "last": false
  }
}
```

### 2.7 일괄 삭제 API

#### 2.7.1 기본 정보

- **URL**: `/api/responsibilities/bulk-delete`
- **Method**: DELETE
- **Content-Type**: application/json

#### 2.7.2 요청 명세

##### Request Body

```json
{
  "responsibilityIds": [1001, 1002, 1003]
}
```

### 2.8 변경이력 조회 API

#### 2.8.1 기본 정보

- **URL**: `/api/responsibilities/{id}/history`
- **Method**: GET

#### 2.8.2 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "변경이력 조회가 완료되었습니다.",
  "data": [
    {
      "changeDate": "2024-12-19T14:30:00.000Z",
      "changeType": "UPDATE",
      "changedBy": "user001",
      "changeDetails": "책무 내용 수정",
      "beforeValue": "이전 책무 내용",
      "afterValue": "수정된 책무 내용"
    }
  ]
}
```

### 2.9 Excel 내보내기 API

#### 2.9.1 기본 정보

- **URL**: `/api/responsibilities/export`
- **Method**: GET
- **Response**: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

#### 2.9.2 요청 명세

##### Query Parameters

| 파라미터명       | 타입   | 필수 | 설명               | 기본값 |
| ---------------- | ------ | ---- | ------------------ | ------ |
| ledgerOrder      | String | N    | 원장차수 코드 필터 | -      |
| responsibilityId | Long   | N    | 책무 ID 필터       | -      |

### 2.10 응답 데이터 모델

#### 2.10.1 ResponsibilityStatusDto 모델

| 필드명                      | 타입          | 필수 | 설명                          |
| --------------------------- | ------------- | ---- | ----------------------------- |
| responsibilityId            | Long          | Y    | 책무 ID (BIGSERIAL)           |
| responsibilityContent       | String        | Y    | 책무 내용                     |
| responsibilityDetailId      | Long          | Y    | 세부내용 ID (BIGSERIAL)       |
| responsibilityDetailContent | String        | Y    | 책무 세부내용                 |
| responsibilityMgtSts        | String        | Y    | 책무이행을 위한 주요 관리업무 |
| responsibilityRelEvid       | String        | Y    | 관련 근거                     |
| createdAt                   | LocalDateTime | Y    | 생성일시                      |
| updatedAt                   | LocalDateTime | Y    | 수정일시                      |

#### 2.10.2 ResponsibilityResponseDto 모델

| 필드명                | 타입                                  | 필수 | 설명          |
| --------------------- | ------------------------------------- | ---- | ------------- |
| id                    | Long                                  | Y    | 책무 ID       |
| responsibilityContent | String                                | Y    | 책무 내용     |
| details               | List<ResponsibilityDetailResponseDto> | Y    | 세부내용 목록 |

## 3. 서비스 로직

### 3.1 서비스 플로우

```
1. 요청 수신 및 인증 검증
   ↓
2. 입력 파라미터 유효성 검증
   ↓
3. 책무 기본 정보 처리 (responsibility 테이블)
   ↓
4. 세부내용 동적 관리 (responsibility_detail 테이블)
   ↓
5. 트랜잭션 커밋 및 응답 데이터 가공
   ↓
6. 감사 로그 기록
```

### 3.2 상세 로직

#### 3.2.1 책무 생성 로직

```java
@Transactional
public Responsibility createResponsibility(ResponsibilityCreateRequestDto requestDto) {
    // 1. 책무(Responsibility) 정보 저장
    Responsibility responsibility = Responsibility.builder()
        .responsibilityContent(requestDto.getResponsibilityContent())
        .build();
    Responsibility savedResponsibility = responsibilityRepository.save(responsibility);

    // 2. 세부내용 정보 저장
    for (ResponsibilityDetailDto detailDto : requestDto.getDetails()) {
        ResponsibilityDetail detail = ResponsibilityDetail.builder()
            .responsibility(savedResponsibility)
            .responsibilityDetailContent(detailDto.getResponsibilityDetailContent())
            .responsibilityMgtSts(detailDto.getKeyManagementTasks())
            .responsibilityRelEvid(detailDto.getRelatedBasis())
            .build();
        responsibilityDetailRepository.save(detail);
    }

    return savedResponsibility;
}
```

#### 3.2.2 Replace 패턴 수정 로직

```java
@Transactional
public Responsibility updateResponsibility(Long id, ResponsibilityCreateRequestDto requestDto) {
    // 1. 기존 책무 조회
    Responsibility responsibility = responsibilityRepository.findById(id)
        .orElseThrow(() -> new BusinessException("수정할 책무를 찾을 수 없습니다. ID: " + id));

    // 2. 책무 기본 정보 수정
    responsibility.setResponsibilityContent(requestDto.getResponsibilityContent());

    // 3. 기존 세부내용 삭제 (Replace 패턴)
    List<ResponsibilityDetail> existingDetails =
        responsibilityDetailRepository.findAllByResponsibilityId(id);
    responsibilityDetailRepository.deleteAll(existingDetails);

    // 4. 새로운 세부내용 추가
    for (ResponsibilityDetailDto detailDto : requestDto.getDetails()) {
        ResponsibilityDetail newDetail = ResponsibilityDetail.builder()
            .responsibility(responsibility)
            .responsibilityDetailContent(detailDto.getResponsibilityDetailContent())
            .responsibilityMgtSts(detailDto.getKeyManagementTasks())
            .responsibilityRelEvid(detailDto.getRelatedBasis())
            .build();
        responsibilityDetailRepository.save(newDetail);
    }

    return responsibility;
}
```

#### 3.2.3 1:N 관계 현황 조회 로직

```java
public List<ResponsibilityStatusDto> getResponsibilityStatusList(Long responsibilityId) {
    if (responsibilityId != null) {
        // 특정 책무의 세부내용 조회
        return responsibilityDetailRepository.findResponsibilityStatusListById(responsibilityId);
    }
    // 전체 책무 현황 조회 (1:N 관계를 플랫 구조로 변환)
    return responsibilityDetailRepository.findResponsibilityStatusList();
}
```

#### 3.2.4 사용여부 필터링 로직

```java
// Entity에서 기본값 설정
@PrePersist
public void prePersist() {
    this.responsibilityUseYn = (this.responsibilityUseYn == null) ? "Y" : this.responsibilityUseYn;
}

// Repository에서 사용여부 Y만 조회
@Query("SELECT ... FROM ResponsibilityDetail d WHERE d.responsibilityUseYn = 'Y' ...")
List<ResponsibilityStatusDto> findActiveResponsibilityStatusList();
```

## 4. 데이터베이스 연동

### 4.1 테이블 접근

- **메인 테이블**: responsibility (BIGSERIAL PK)
- **관련 테이블**: responsibility_detail (1:N 관계, CASCADE DELETE)
- **접근 방식**: Read/Write
- **관계**: responsibility(1) : responsibility_detail(N)

### 4.2 SQL 쿼리

#### 4.2.1 1:N 관계 현황 조회 (JPQL)

```sql
SELECT new org.itcen.domain.responsibility.dto.ResponsibilityStatusDto(
    d.responsibility.id,
    d.responsibility.responsibilityContent,
    d.id,
    d.responsibilityDetailContent,
    d.responsibilityMgtSts,
    d.responsibilityRelEvid,
    d.createdAt,
    d.updatedAt
)
FROM ResponsibilityDetail d
JOIN d.responsibility r
WHERE d.responsibilityUseYn = 'Y'
ORDER BY r.id, d.id
```

#### 4.2.2 특정 책무 세부내용 조회

```sql
SELECT new org.itcen.domain.responsibility.dto.ResponsibilityStatusDto(
    d.responsibility.id,
    d.responsibility.responsibilityContent,
    d.id,
    d.responsibilityDetailContent,
    d.responsibilityMgtSts,
    d.responsibilityRelEvid,
    d.createdAt,
    d.updatedAt
)
FROM ResponsibilityDetail d
JOIN d.responsibility r
WHERE r.id = :responsibilityId
  AND d.responsibilityUseYn = 'Y'
ORDER BY r.id, d.id
```

#### 4.2.3 검색 조건 쿼리

```sql
SELECT d FROM ResponsibilityDetail d
JOIN d.responsibility r
WHERE (:ledgerOrder IS NULL OR r.ledgerOrder = :ledgerOrder)
  AND (:responsibilityId IS NULL OR r.id = :responsibilityId)
  AND d.responsibilityUseYn = 'Y'
ORDER BY r.createdAt DESC, d.id
```

### 4.3 Connection Pool 설정

- **초기 연결 수**: 5
- **최대 연결 수**: 20
- **타임아웃**: 5초
- **검증 쿼리**: SELECT 1

## 5. 보안 고려사항

### 5.1 인증 및 인가

- **인증 방식**: JWT Bearer Token
- **토큰 만료**: 1시간
- **권한 검증**: 책무 관리 권한 필수

### 5.2 데이터 보호

- **전송 암호화**: HTTPS/TLS 1.3
- **입력값 검증**: XSS 방지, SQL Injection 방지
- **민감정보**: 책무 내용에 대한 접근 제어

### 5.3 데이터 무결성

- **CASCADE 정책**: 책무 삭제 시 관련 세부내용 자동 삭제
- **트랜잭션 처리**: 1:N 관계 관리 시 데이터 일관성 보장
- **사용여부 관리**: 논리적 삭제로 데이터 보존

## 6. 예외 처리

### 6.1 예외 코드 정의

| 코드  | HTTP Status | 메시지                        | 설명                   |
| ----- | ----------- | ----------------------------- | ---------------------- |
| RS200 | 200         | 책무 처리 성공                | 정상 처리              |
| RS400 | 400         | 잘못된 요청입니다             | 유효성 검증 실패       |
| RS401 | 401         | 인증이 필요합니다             | 인증 토큰 없음/만료    |
| RS403 | 403         | 접근 권한이 없습니다          | 권한 부족              |
| RS404 | 404         | 책무를 찾을 수 없습니다       | 책무 미존재            |
| RS409 | 409         | 데이터 무결성 오류            | 세부내용 제약조건 위반 |
| RS500 | 500         | 내부 서버 오류가 발생했습니다 | 시스템 오류            |

### 6.2 예외 처리 로직

```java
@RestControllerAdvice
public class ResponsibilityExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        ApiResponse<Void> response = ApiResponse.<Void>builder()
            .success(false)
            .message(ex.getMessage())
            .build();
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityException(DataIntegrityViolationException ex) {
        ApiResponse<Void> response = ApiResponse.<Void>builder()
            .success(false)
            .message("세부내용 데이터 무결성 오류가 발생했습니다.")
            .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}
```

## 7. 성능 고려사항

### 7.1 캐싱 전략

- **캐시 유형**: Redis 기반 분산 캐시
- **캐시 키**:
  - 책무 상세: `responsibility:detail:{responsibilityId}`
  - 현황 목록: `responsibility:status:list`
  - 검색 결과: `responsibility:search:{hash}`
- **TTL**: 1800초 (30분)
- **캐시 무효화**: 책무 정보 변경 시

### 7.2 성능 목표

- **응답 시간**: 평균 3초 이내
- **처리량**: 초당 300 TPS
- **동시 사용자**: 최대 100명
- **가용성**: 99.9% 이상

### 7.3 인덱스 최적화

- **Primary Index**: responsibility_id (BIGSERIAL)
- **Secondary Index**:
  - idx_responsibility_detail_responsibility_id
  - idx_responsibility_detail_use_yn
  - idx_responsibility_ledger_order

### 7.4 1:N 관계 성능 최적화

- **JPQL 최적화**: JOIN 쿼리로 N+1 문제 방지
- **페이징 처리**: 대용량 세부내용 데이터 처리
- **Lazy Loading**: 필요시에만 세부내용 로딩
- **Batch Processing**: 일괄 삭제/수정 시 배치 처리

## 8. 감사 및 로깅

### 8.1 감사 로그

```json
{
  "eventType": "RESPONSIBILITY_CREATE",
  "timestamp": "2024-12-19T14:30:00.000Z",
  "userId": "user001",
  "responsibilityId": 1001,
  "responsibilityContent": "위험관리 책무",
  "detailsCount": 3,
  "requestId": "req-20241219-002",
  "clientIp": "192.168.1.100",
  "userAgent": "ItcenApp/1.0",
  "result": "SUCCESS"
}
```

### 8.2 로그 레벨

- **DEBUG**: 상세 실행 과정, 세부내용 처리 과정
- **INFO**: 정상 처리 완료, 1:N 관계 관리 성공
- **WARN**: 세부내용 불일치, 권한 부족
- **ERROR**: 시스템 오류, 데이터 무결성 위반

### 8.3 변경이력 추적

- **변경 유형**: CREATE, UPDATE, DELETE, DETAIL_CHANGE
- **추적 대상**: 책무 내용, 세부내용 추가/삭제/수정
- **보관 기간**: 6개월
- **접근 권한**: 변경이력 조회 권한 보유자만

## 9. 배포 및 운영

### 9.1 배포 환경

- **개발**: dev-responsibility-api.itcen.org
- **스테이징**: stg-responsibility-api.itcen.org
- **운영**: responsibility-api.itcen.org

### 9.2 헬스체크

- **URL**: `/actuator/health`
- **체크 항목**:
  - 데이터베이스 연결 상태
  - 1:N 관계 테이블 접근 가능성
  - 메모리 사용량
  - 디스크 공간

### 9.3 모니터링 및 알람

- **메트릭**: 응답시간, 처리량, 에러율, 세부내용 처리 시간
- **알람 조건**:
  - 응답시간 5초 초과
  - 에러율 3% 초과
  - 메모리 사용량 80% 초과
  - 1:N 관계 무결성 오류
- **알람 대상**: 개발팀, 운영팀

## 10. 테스트

### 10.1 단위 테스트

- **Coverage**: 80% 이상
- **프레임워크**: JUnit 5, Mockito
- **테스트 데이터**: 다양한 세부내용 조합

### 10.2 통합 테스트

- **데이터베이스**: H2 Embedded
- **테스트 시나리오**:
  - 책무 1:N 관계 전체 플로우
  - Replace 패턴 수정 검증
  - CASCADE 삭제 검증
  - 사용여부 필터링 검증

### 10.3 성능 테스트

- **도구**: JMeter
- **부하 조건**: 300 TPS, 10분간
- **시나리오**:
  - 현황 목록 조회 60%
  - 상세 조회 25%
  - 생성/수정/삭제 15%

## 11. 비즈니스 규칙

### 11.1 1:N 관계 관리 규칙

- **책무-세부내용**: 하나의 책무에 여러 세부내용 관리 가능
- **CASCADE 삭제**: 책무 삭제 시 관련 세부내용 자동 삭제
- **동적 관리**: 세부내용 추가/삭제 시 실시간 반영

### 11.2 세부내용 관리

- **사용여부**: Y/N으로 논리적 삭제 관리
- **필터링**: 사용여부 'Y'인 데이터만 조회
- **Replace 패턴**: 수정 시 기존 삭제 후 새로 생성

### 11.3 데이터 표시 규칙

- **1:N 플랫 구조**: 현황 조회 시 세부내용별로 행 분리 표시
- **계층 구조**: 상세 조회 시 책무 하위에 세부내용 목록 표시
- **정렬 순서**: 책무ID 오름차순, 세부내용ID 오름차순

### 11.4 변경이력 정책

- **추적 범위**: 책무 내용, 세부내용 전체 변경사항
- **보관 기간**: 6개월
- **접근 제어**: 변경이력 조회 권한 필요

### 11.5 데이터 무결성 정책

- **트랜잭션 보장**: 1:N 관계 관리 시 전체 성공 또는 전체 실패
- **외래키 제약**: responsibility_detail.responsibility_id 참조 무결성
- **BIGSERIAL PK**: 자동증가로 고유성 보장

## 12. 변경 이력

- 2024-12-19: 최초 작성 (RS03001M 책무DB현황관리)
