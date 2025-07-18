# 상품정보조회 서비스 설계서

## 1. 서비스 개요

### 1.1 서비스 목적
상품코드를 기반으로 금융상품 정보를 조회하는 RESTful API 서비스를 제공한다. 상품의 기본정보, 가입조건, 판매상태 등을 포함한 종합적인 상품정보를 반환한다.

### 1.2 서비스 범위
- 상품코드 기반 상품정보 조회
- 판매상태 및 가입조건 검증
- 상품정보 유효성 검증
- 상품 가입자격 확인 지원

### 1.3 서비스 특성
- **서비스명**: ProductInfoService
- **서비스 유형**: 조회 서비스 (Read-Only)
- **응답 시간**: 평균 50ms 이하
- **가용성**: 99.9% 이상

## 2. API 명세

### 2.1 상품정보 조회 API

#### 2.1.1 기본 정보
- **URL**: `/api/v1/products/{productCode}`
- **Method**: GET
- **Content-Type**: application/json
- **인증**: Bearer Token 필수

#### 2.1.2 요청 명세

##### Path Parameters
| 파라미터명 | 타입 | 필수 | 설명 | 예시 |
|-----------|------|------|------|------|
| productCode | String | Y | 상품코드 (3-20자리) | PD001 |

##### Query Parameters
| 파라미터명 | 타입 | 필수 | 설명 | 기본값 |
|-----------|------|------|------|--------|
| includeInactive | Boolean | N | 판매중지 상품 포함 여부 | false |

##### Request Headers
| 헤더명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| Authorization | String | Y | Bearer {access_token} |
| X-Request-ID | String | Y | 요청 추적용 고유 ID |
| X-User-ID | String | Y | 요청자 사용자 ID |

##### Request Example
```http
GET /api/v1/products/PD001 HTTP/1.1
Host: api.bank.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Request-ID: req-20241204-002
X-User-ID: user001
```

#### 2.1.3 응답 명세

##### 성공 응답 (200 OK)
```json
{
  "code": "PF200",
  "message": "상품정보 조회 성공",
  "timestamp": "2024-12-04T14:30:00.000Z",
  "data": {
    "productCode": "PD001",
    "productName": "보통예금",
    "productType": "01",
    "productTypeText": "요구불",
    "baseRate": 0.10,
    "salesStatus": "00",
    "salesStatusText": "판매중",
    "eligibleCustomerType": "1",
    "eligibleCustomerTypeText": "개인",
    "minAge": 0,
    "maxAge": 999,
    "ageRange": "제한없음",
    "minEnrollAmount": 1000,
    "maxEnrollAmount": 999999999,
    "enrollCondition": "신분증 지참, 본인 확인 필수",
    "registrationDate": "20200101",
    "lastUpdateDate": "20241201"
  }
}
```

##### 실패 응답
```json
{
  "code": "PF404",
  "message": "입력하신 상품코드에 해당하는 상품이 존재하지 않습니다.",
  "timestamp": "2024-12-04T14:30:00.000Z",
  "errors": [
    {
      "field": "productCode",
      "value": "XX999",
      "reason": "PRODUCT_NOT_FOUND"
    }
  ]
}
```

### 2.2 상품 목록 조회 API

#### 2.2.1 기본 정보
- **URL**: `/api/v1/products`
- **Method**: GET
- **Content-Type**: application/json

#### 2.2.2 요청 명세

##### Query Parameters
| 파라미터명 | 타입 | 필수 | 설명 | 기본값 |
|-----------|------|------|------|--------|
| productType | String | N | 상품유형 (01,11,21) | - |
| salesStatus | String | N | 판매상태 (00,99) | 00 |
| page | Integer | N | 페이지 번호 | 1 |
| size | Integer | N | 페이지 크기 | 10 |

##### 성공 응답 (200 OK)
```json
{
  "code": "PF200",
  "message": "상품목록 조회 성공",
  "timestamp": "2024-12-04T14:30:00.000Z",
  "data": {
    "products": [
      {
        "productCode": "PD001",
        "productName": "보통예금",
        "productType": "01",
        "productTypeText": "요구불",
        "baseRate": 0.10,
        "salesStatus": "00",
        "salesStatusText": "판매중"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalElements": 25,
      "size": 10
    }
  }
}
```

### 2.3 응답 데이터 모델

#### 2.3.1 ProductInfo 모델
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| productCode | String | Y | 상품코드 |
| productName | String | Y | 상품명 |
| productType | String | Y | 상품유형 코드 (01:요구불, 11:적립식, 21:거치식) |
| productTypeText | String | Y | 상품유형 텍스트 |
| baseRate | Decimal | N | 기본금리 (%) |
| salesStatus | String | Y | 판매상태 코드 (00:판매중, 99:판매중지) |
| salesStatusText | String | Y | 판매상태 텍스트 |
| eligibleCustomerType | String | Y | 가입가능고객구분 (1:개인, 2:기업) |
| eligibleCustomerTypeText | String | Y | 가입가능고객구분 텍스트 |
| minAge | Integer | N | 최소 가입가능연령 |
| maxAge | Integer | N | 최대 가입가능연령 |
| ageRange | String | Y | 가입가능연령 범위 텍스트 |
| minEnrollAmount | Long | N | 최소 가입금액 |
| maxEnrollAmount | Long | N | 최대 가입금액 |
| enrollCondition | String | N | 가입조건 |
| registrationDate | String | Y | 등록일자 (YYYYMMDD) |
| lastUpdateDate | String | N | 최종수정일자 (YYYYMMDD) |

## 3. 서비스 로직

### 3.1 서비스 플로우
```
1. 요청 수신 및 인증 검증
   ↓
2. 입력 파라미터 유효성 검증
   ↓
3. 접근 권한 검증
   ↓
4. 데이터베이스 조회
   ↓
5. 판매상태 및 가입조건 확인
   ↓
6. 응답 데이터 가공 및 반환
   ↓
7. 감사 로그 기록
```

### 3.2 상세 로직

#### 3.2.1 유효성 검증
```java
public class ProductInfoValidator {
    
    public void validateProductCode(String productCode) {
        // 필수값 검증
        if (StringUtils.isEmpty(productCode)) {
            throw new ValidationException("PF400", "상품코드를 입력해 주세요.");
        }
        
        // 길이 검증
        if (productCode.length() < 3 || productCode.length() > 20) {
            throw new ValidationException("PF400", "상품코드는 3자 이상 20자 이하로 입력해 주세요.");
        }
        
        // 형식 검증 (영문 대문자 + 숫자)
        if (!productCode.matches("^[A-Z]{2}\\d{3}$")) {
            throw new ValidationException("PF400", "상품코드는 영문 대문자와 숫자 조합으로 입력해 주세요.");
        }
    }
}
```

#### 3.2.2 데이터 조회 및 가공
```java
@Service
public class ProductInfoService {
    
    @Autowired
    private ProductInfoRepository productRepository;
    
    public ProductInfoResponse getProductInfo(String productCode, boolean includeInactive) {
        // 데이터베이스 조회
        ProductInfo product = productRepository.findByProductCode(productCode)
            .orElseThrow(() -> new BusinessException("PF404", 
                "입력하신 상품코드에 해당하는 상품이 존재하지 않습니다."));
        
        // 판매상태 확인
        if (!includeInactive && !"00".equals(product.getSalesStatus())) {
            throw new BusinessException("PF410", "해당 상품은 현재 판매중지 상태입니다.");
        }
        
        // 응답 데이터 가공
        return ProductInfoResponse.builder()
            .productCode(product.getProductCode())
            .productName(product.getProductName())
            .productType(product.getProductType())
            .productTypeText(getProductTypeText(product.getProductType()))
            .baseRate(product.getBaseRate())
            .salesStatus(product.getSalesStatus())
            .salesStatusText(getSalesStatusText(product.getSalesStatus()))
            .eligibleCustomerType(product.getEligibleCustomerType())
            .eligibleCustomerTypeText(getCustomerTypeText(product.getEligibleCustomerType()))
            .minAge(product.getMinAge())
            .maxAge(product.getMaxAge())
            .ageRange(getAgeRangeText(product.getMinAge(), product.getMaxAge()))
            .minEnrollAmount(product.getMinEnrollAmount())
            .maxEnrollAmount(product.getMaxEnrollAmount())
            .enrollCondition(product.getEnrollCondition())
            .registrationDate(product.getRegistrationDate())
            .lastUpdateDate(product.getLastUpdateDate())
            .build();
    }
    
    private String getAgeRangeText(Integer minAge, Integer maxAge) {
        if (minAge == null && maxAge == null) {
            return "제한없음";
        } else if (minAge != null && maxAge != null) {
            return String.format("만 %d세 - %d세", minAge, maxAge);
        } else if (minAge != null) {
            return String.format("만 %d세 이상", minAge);
        } else {
            return String.format("만 %d세 이하", maxAge);
        }
    }
}
```

## 4. 데이터베이스 연동

### 4.1 테이블 접근
- **테이블명**: PRODUCT_INFO
- **접근 방식**: Read-Only
- **인덱스 활용**: PK(PRD_CD), IDX_PRODUCT_SAL_STS, IDX_PRODUCT_TYP

### 4.2 SQL 쿼리

#### 4.2.1 단일 상품 조회
```sql
SELECT 
    PRD_CD,
    PRD_NM,
    PRD_TYP,
    BASE_RT,
    ENR_AVL_CUST_TP,
    ENR_AVL_MIN_AGE,
    ENR_AVL_MAX_AGE,
    SAL_STS,
    MIN_ENR_AMT,
    MAX_ENR_AMT,
    ENR_COND,
    REG_DT,
    UPD_DT
FROM PRODUCT_INFO 
WHERE PRD_CD = ?
```

#### 4.2.2 상품 목록 조회
```sql
SELECT 
    PRD_CD,
    PRD_NM,
    PRD_TYP,
    BASE_RT,
    SAL_STS
FROM PRODUCT_INFO 
WHERE 1=1
  AND (? IS NULL OR PRD_TYP = ?)
  AND (? IS NULL OR SAL_STS = ?)
ORDER BY REG_DT DESC
LIMIT ? OFFSET ?
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
- **권한 검증**: 상품정보조회 권한 필수

### 5.2 데이터 보호
- **전송 암호화**: HTTPS/TLS 1.3
- **민감정보**: 상품정보는 일반적으로 공개 정보이나 내부 관리용 데이터는 보호

### 5.3 SQL Injection 방지
- PreparedStatement 사용
- 입력값 바인딩 처리
- 동적 쿼리 생성 시 화이트리스트 검증

## 6. 예외 처리

### 6.1 예외 코드 정의
| 코드 | HTTP Status | 메시지 | 설명 |
|------|-------------|--------|------|
| PF200 | 200 | 상품정보 조회 성공 | 정상 처리 |
| PF400 | 400 | 잘못된 요청입니다 | 유효성 검증 실패 |
| PF401 | 401 | 인증이 필요합니다 | 인증 토큰 없음/만료 |
| PF403 | 403 | 접근 권한이 없습니다 | 권한 부족 |
| PF404 | 404 | 상품정보를 찾을 수 없습니다 | 상품 미존재 |
| PF410 | 410 | 판매중지된 상품입니다 | 판매중지 상품 조회 시도 |
| PF500 | 500 | 내부 서버 오류가 발생했습니다 | 시스템 오류 |
| PF503 | 503 | 서비스를 사용할 수 없습니다 | 서비스 점검 |

### 6.2 예외 처리 로직
```java
@RestControllerAdvice
public class ProductServiceExceptionHandler {
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
        ErrorResponse response = ErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.badRequest().body(response);
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        if ("PF410".equals(ex.getCode())) {
            status = HttpStatus.GONE;
        }
        
        ErrorResponse response = ErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(status).body(response);
    }
}
```

## 7. 성능 고려사항

### 7.1 캐싱 전략
- **캐시 유형**: Redis 기반 분산 캐시
- **캐시 키**: 
  - 단일 상품: `product:info:{productCode}`
  - 상품 목록: `product:list:{type}:{status}:{page}:{size}`
- **TTL**: 1800초 (30분)
- **캐시 무효화**: 상품정보 변경 시

### 7.2 성능 목표
- **응답 시간**: 평균 50ms 이하
- **처리량**: 초당 2,000 TPS
- **가용성**: 99.9% 이상

### 7.3 인덱스 최적화
- **Primary Index**: PRD_CD
- **Secondary Index**: SAL_STS, PRD_TYP
- **Composite Index**: (SAL_STS, PRD_TYP, REG_DT)

## 8. 감사 및 로깅

### 8.1 감사 로그
```json
{
  "eventType": "PRODUCT_INFO_INQUIRY",
  "timestamp": "2024-12-04T14:30:00.000Z",
  "userId": "user001",
  "productCode": "PD001",
  "requestId": "req-20241204-002",
  "clientIp": "192.168.1.100",
  "userAgent": "BankApp/1.0",
  "result": "SUCCESS"
}
```

### 8.2 로그 레벨
- **DEBUG**: 상세 실행 과정
- **INFO**: 정상 처리 완료
- **WARN**: 주의 사항 (판매중지 상품 조회 등)
- **ERROR**: 시스템 오류

## 9. 배포 및 운영

### 9.1 배포 환경
- **개발**: dev-product-api.bank.com
- **스테이징**: stg-product-api.bank.com
- **운영**: product-api.bank.com

### 9.2 헬스체크
- **URL**: `/actuator/health`
- **체크 항목**: DB 연결, Redis 연결, 메모리 사용량

### 9.3 모니터링
- **메트릭**: 응답시간, 처리량, 에러율
- **알람**: 응답시간 100ms 초과, 에러율 1% 초과

## 10. 테스트

### 10.1 단위 테스트
- **Coverage**: 80% 이상
- **프레임워크**: JUnit 5, Mockito
- **테스트 데이터**: 다양한 상품유형 및 판매상태

### 10.2 통합 테스트
- **데이터베이스**: H2 Embedded
- **테스트 시나리오**: 
  - 정상 상품 조회
  - 판매중지 상품 조회
  - 존재하지 않는 상품 조회
  - 목록 조회 및 페이징

### 10.3 성능 테스트
- **도구**: JMeter
- **부하 조건**: 2,000 TPS, 10분간
- **시나리오**: 단일 상품 조회, 목록 조회 혼합

## 11. 비즈니스 규칙

### 11.1 상품유형별 특성
- **요구불(01)**: 입출금 자유, 최소 가입금액 낮음
- **적립식(11)**: 정기 납입, 연령 제한 있을 수 있음
- **거치식(21)**: 일시 예치, 최소 가입금액 높음

### 11.2 판매상태 관리
- **판매중(00)**: 신규 가입 가능
- **판매중지(99)**: 신규 가입 불가, 기존 계좌 유지

### 11.3 가입자격 검증
- **연령 제한**: 만 나이 기준
- **고객구분**: 개인/기업별 제한
- **가입금액**: 최소/최대 한도 확인

## 12. 변경 이력
- 2024-12-04: 최초 작성 