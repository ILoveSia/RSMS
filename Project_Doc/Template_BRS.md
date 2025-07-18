# 수신계좌조회 요구사항정의서 (DP03001M)

## 1. 문서개요

### 1.1 문서정보
- **문서명**: 수신계좌조회 요구사항정의서
- **화면ID**: DP03001M
- **화면명**: 수신계좌조회
- **작성일**: 2024-12-06
- **작성자**: 시스템개발팀
- **버전**: 1.0

### 1.2 목적
- 부점별, 고객별 수신계좌정보를 조회하는 기능을 정의
- 검색조건에 따른 계좌목록 조회 및 상세정보 표시
- Excel 내보내기 등 부가기능 제공

## 2. 기능요구사항

### 2.1 주요기능
| 기능ID | 기능명 | 설명 |
|--------|--------|------|
| F001 | 부점검색 | 부점번호 입력 시 부점명 자동조회 |
| F002 | 고객검색 | 고객번호 입력 시 고객명 자동조회 |
| F003 | 상품검색 | 상품코드 입력 시 상품명 자동조회 |
| F004 | 계좌조회 | 조건에 따른 계좌목록 조회 |
| F005 | 그리드표시 | 조회결과를 그리드 형태로 표시 |
| F006 | Excel내보내기 | 조회결과를 Excel 파일로 내보내기 |
| F007 | 초기화 | 모든 입력조건 및 결과 초기화 |

### 2.2 조회조건
| 항목 | 필수여부 | 설명 | 검증규칙 |
|------|----------|------|---------|
| 부점번호 | 선택 | 부점코드 4자리 | 숫자 4자리 |
| 고객번호 | 선택 | 고객번호 10자리 | 숫자 10자리 |
| 상품코드 | 선택 | 상품코드 | 영문대문자+숫자 |
| 계좌상태 | 선택 | 1:정상, 2:해지, 9:정지 | 코드값 |

**조회조건 검증**: 부점번호 또는 고객번호 중 하나는 필수

### 2.3 조회결과 항목
| 항목 | 표시명 | 설명 | 형식 |
|------|--------|------|------|
| accountNo | 계좌번호 | 계좌번호 | 문자 |
| customerNo | 고객번호 | 고객번호 | 숫자 10자리 |
| customerName | 고객명 | 고객명 (마스킹) | 홍*동 |
| productCode | 상품코드 | 상품코드 | 문자 |
| productName | 상품명 | 상품명 | 문자 |
| branchId | 부점번호 | 부점번호 | 숫자 4자리 |
| branchName | 부점명 | 부점명 | 문자 |
| balance | 잔액 | 계좌 잔액 | 숫자 (원화) |
| openDate | 개설일 | 계좌 개설일 | YYYY-MM-DD |
| maturityDate | 만기일 | 계좌 만기일 | YYYY-MM-DD |
| interestRate | 이율 | 적용 이율 | 소수점 2자리 |
| accountStatusText | 상태 | 계좌상태명 | 정상/해지/정지 |
| passbookIssue | 통장발행 | 통장발행여부 | 발행/미발행 |

## 3. 비기능요구사항

### 3.1 성능요구사항
- **조회응답시간**: 평균 3초 이내
- **동시사용자**: 최대 50명
- **페이징처리**: 한 페이지 최대 100건

### 3.2 보안요구사항
- **인증**: 사용자 로그인 필수
- **권한**: 조회권한 보유자만 접근
- **개인정보보호**: 고객명 마스킹 처리

### 3.3 사용성요구사항
- **반응형화면**: 다양한 해상도 지원
- **한국어지원**: 모든 메시지 한국어 표시
- **키보드네비게이션**: Tab, Enter 키 지원

## 4. 제약사항

### 4.1 기술제약사항
- **브라우저**: Chrome, Firefox, Edge 지원
- **JavaScript**: ES6 이상
- **그리드**: Tabulator 라이브러리 사용

### 4.2 업무제약사항
- **조회권한**: 본인 담당 부점만 조회 가능
- **데이터보존**: 조회 로그 3개월 보관
- **업무시간**: 평일 09:00-18:00 서비스

## 5. 연동시스템

### 5.1 내부연동
| 시스템명 | 연동내용 | 방식 |
|---------|---------|------|
| 부점관리시스템 | 부점정보 조회 | REST API |
| 고객관리시스템 | 고객정보 조회 | REST API |
| 상품관리시스템 | 상품정보 조회 | REST API |
| 계좌관리시스템 | 계좌정보 조회 | REST API |

## 6. 기대효과

### 6.1 업무효율성
- 통합조회로 업무시간 단축
- 자동조회로 입력오류 방지
- Excel 내보내기로 후속업무 지원

### 6.2 사용자만족도
- 직관적인 UI로 사용편의성 향상
- 빠른 응답속도로 업무효율성 증대 