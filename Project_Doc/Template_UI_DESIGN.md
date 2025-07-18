# 고객정보조회 화면설계서

## 1. 화면구성 (레이아웃)

### 1.1 화면 유형
- **팝업 화면**: 500px(W) × 750px(H)
- **모달 형태**: 배경 dim 처리 및 외부 클릭 시 닫힌 않음

### 1.2 화면 레이아웃
```
┌─────────────────────────────────────────────────┐
│  고객정보조회                            [X]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  [고객번호 입력 영역]                           │
│  ┌─────────────────────────┐  [조회]           │
│  │ 고객번호               │                    │
│  └─────────────────────────┘                    │
│                                                 │
│  [고객정보 표시 영역]                           │
│  ┌─────────────────────────────────────────────┐│
│  │ 고객명        : ________________            ││
│  │ 실명번호      : ________________            ││
│  │ 고객구분      : ________________            ││
│  │ 생년월일      : ________________            ││
│  │ 연락처        : ________________            ││
│  │ 주소          : ________________            ││
│  │               : ________________            ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│              [적용] [닫기]                      │
└─────────────────────────────────────────────────┘
```

### 1.3 영역별 구성
- **헤더 영역**: 제목 및 닫기 버튼
- **입력 영역**: 고객번호 입력 필드 및 조회 버튼
- **정보 표시 영역**: 조회된 고객정보 출력
- **버튼 영역**: 적용, 닫기 버튼

## 2. 화면 상세 속성

### 2.1 입력 컴포넌트

| 컴포넌트명 | 유형 | 속성 | 설명 |
|-----------|------|------|------|
| txtCustomerNo | TextBox | 필수입력, 최대길이 10자 | 고객번호 입력 필드 |
| btnSearch | Button | 활성화 조건: 고객번호 입력 시 | 고객정보 조회 버튼 |

### 2.2 출력 컴포넌트

| 컴포넌트명 | 유형 | 속성 | 설명 |
|-----------|------|------|------|
| lblCustomerName | Label | 읽기전용, 마스킹 처리 | 고객명 표시 |
| lblIdNo | Label | 읽기전용, 마스킹 처리 | 실명번호 표시 |
| lblCustomerType | Label | 읽기전용 | 고객구분 표시 (개인/기업) |
| lblBirthDate | Label | 읽기전용 | 생년월일 표시 (YYYY-MM-DD) |
| lblTelephone | Label | 읽기전용, 마스킹 처리 | 연락처 표시 |
| lblAddress | Label | 읽기전용, 마스킹 처리 | 주소 표시 |

### 2.3 버튼 컴포넌트

| 컴포넌트명 | 유형 | 속성 | 설명 |
|-----------|------|------|------|
| btnApply | Button | 활성화 조건: 고객정보 조회 완료 시 | 선택한 고객정보를 메인화면에 적용 |
| btnClose | Button | 항상 활성화 | 팝업 닫기 |
| btnX | Button | 항상 활성화 | 헤더 닫기 버튼 |

## 3. 이벤트

### 3.1 화면 로드 이벤트
- **이벤트명**: Form_Load
- **처리내용**: 
  - 고객번호 입력 필드에 포커스 설정
  - 고객정보 표시 영역 초기화
  - 적용 버튼 비활성화

### 3.2 고객번호 입력 이벤트
- **이벤트명**: txtCustomerNo_TextChanged
- **처리내용**:
  - 입력값이 있을 때 조회 버튼 활성화
  - 입력값이 없을 때 조회 버튼 비활성화
  - 고객정보 표시 영역 초기화

### 3.3 조회 버튼 클릭 이벤트
- **이벤트명**: btnSearch_Click
- **처리내용**:
  1. 고객번호 유효성 검증 수행
  2. 검증 통과 시 고객정보조회 서비스 호출
  3. 조회 성공 시:
     - 고객정보 표시 영역에 데이터 바인딩
     - 개인정보 마스킹 처리 적용
     - 고객구분에 따른 텍스트 변환 (1:개인, 2:기업)
     - 적용 버튼 활성화
  4. 조회 실패 시:
     - 오류 메시지 표시
     - 고객정보 표시 영역 초기화

### 3.4 적용 버튼 클릭 이벤트
- **이벤트명**: btnApply_Click
- **처리내용**:
  - 조회된 고객정보를 메인화면으로 전달
  - 팝업 닫기
  - 콜백 함수 실행 (메인화면에서 정의)

### 3.5 닫기 버튼 클릭 이벤트
- **이벤트명**: btnClose_Click, btnX_Click
- **처리내용**:
  - 변경사항 확인 없이 팝업 닫기
  - 부모 화면으로 포커스 이동

### 3.6 키보드 이벤트
- **Enter 키**: 고객번호 입력 필드에서 Enter 키 입력 시 조회 버튼 클릭과 동일한 처리
- **ESC 키**: 팝업 닫기

## 4. Validation

### 4.1 고객번호 유효성 검증

#### 4.1.1 필수 입력 검증
- **검증조건**: 고객번호가 공백이거나 NULL인 경우
- **오류메시지**: "고객번호를 입력해 주세요."
- **처리방법**: 고객번호 입력 필드에 포커스 이동

#### 4.1.2 형식 검증
- **검증조건**: 고객번호가 숫자가 아닌 경우
- **오류메시지**: "고객번호는 숫자만 입력해 주세요."
- **처리방법**: 고객번호 입력 필드 선택 상태로 변경

#### 4.1.3 길이 검증
- **검증조건**: 고객번호가 10자가 아닌 경우
- **오류메시지**: "고객번호는 10자리로 입력해 주세요."
- **처리방법**: 고객번호 입력 필드에 포커스 이동

#### 4.1.4 존재여부 검증
- **검증조건**: 입력한 고객번호가 시스템에 존재하지 않는 경우
- **오류메시지**: "입력하신 고객번호에 해당하는 고객이 존재하지 않습니다."
- **처리방법**: 고객번호 입력 필드 선택 상태로 변경

### 4.2 시스템 오류 처리

#### 4.2.1 네트워크 오류
- **오류상황**: 서버 통신 실패
- **오류메시지**: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
- **처리방법**: 조회 버튼 재활성화

#### 4.2.2 서버 오류
- **오류상황**: 서버 내부 오류 발생
- **오류메시지**: "시스템 오류가 발생했습니다. 관리자에게 문의해 주세요."
- **처리방법**: 조회 버튼 재활성화

### 4.3 데이터 표시 규칙

#### 4.3.1 마스킹 처리
- **고객명**: 중간 글자 마스킹 (예: 홍*동, 김**수)
- **실명번호**: 뒤 7자리 마스킹 (예: 123456-*******)
- **연락처**: 중간 4자리 마스킹 (예: 010-****-5678)
- **주소**: 상세주소 마스킹 (예: 서울시 강남구 ***)

#### 4.3.2 고객구분 표시
- **개인**: "개인" 텍스트 표시
- **기업**: "기업" 텍스트 표시

#### 4.3.3 생년월일 표시
- **표시형식**: YYYY-MM-DD 형태로 표시 (예: 1990-01-01)
- **NULL 처리**: "-" 표시

#### 4.3.4 텍스트 길이 처리
- **긴 텍스트**: 말줄임표(...) 처리 및 툴팁으로 전체 내용 표시
- **최대 표시 길이**: 각 필드별 30자

## 5. 참고사항

### 5.1 접근성 고려사항
- 모든 입력 필드에 대한 레이블 제공
- 키보드 탐색 순서 설정 (Tab Order)
- 오류 메시지의 스크린리더 지원

### 5.2 성능 고려사항
- 고객정보 조회 시 로딩 인디케이터 표시
- 중복 조회 방지를 위한 버튼 비활성화 처리
- 캐싱을 통한 동일 고객번호 재조회 최적화

### 5.3 보안 고려사항
- 고객번호 입력 시 특수문자 필터링
- SQL Injection 방지를 위한 파라미터 바인딩
- 개인정보 마스킹 처리 의무 적용
- 세션 타임아웃 시 자동 팝업 닫기
- 개인정보 보호 정책에 따른 접근 권한 검증

### 5.4 개인정보 보호 고려사항
- 개인정보 조회 시 사용자 권한 검증
- 조회 이력 로그 저장
- 마스킹 해제 권한 별도 관리
- 화면 캡처 방지 설정

## 6. 변경 이력
- 2024-06-04: 최초 작성 