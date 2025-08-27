# 프로젝트 데이터베이스 ER 다이어그램

## 개요
이 문서는 프로젝트의 데이터베이스 구조와 테이블 간의 관계를 Mermaid 다이어그램으로 표현한 것입니다.

## 데이터베이스 구조도

```mermaid
erDiagram
    %% 사용자 및 인증 관련 테이블
    users {
        varchar(100) id PK
        varchar(20) emp_no
        varchar(50) username UK
        varchar(100) email UK
        varchar(255) address
        varchar(20) mobile
        varchar(255) password
        varchar(100) dept_cd FK
        varchar(100) num
        varchar(100) job_rank_cd
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    departments {
        varchar(20) department_id PK
        varchar(100) department_name UK
        varchar(1) use_yn
        varchar(100) created_id
        varchar(100) updated_id
        timestamptz created_at
        timestamptz updated_at
    }

    roles {
        varchar(20) role_id PK
        varchar(100) role_name
        varchar(500) description
        varchar(1) use_yn
        varchar(100) created_id
        varchar(100) updated_id
        timestamp created_at
        timestamp updated_at
        int8 id
    }

    user_roles {
        varchar(50) user_id PK,FK
        varchar(20) role_id PK,FK
        timestamp assigned_at
        varchar(50) assigned_by
        varchar(1) use_yn
    }

    api_permissions {
        varchar(20) permission_id PK
        varchar(200) api_pattern
        varchar(10) http_method
        varchar(100) permission_name
        varchar(500) description
        varchar(1) is_public
        varchar(1) use_yn
        varchar(100) created_id
        varchar(100) updated_id
        timestamp created_at
        timestamp updated_at
    }

    role_permissions {
        varchar(20) role_id PK,FK
        varchar(20) permission_id PK,FK
        timestamp granted_at
        varchar(50) granted_by
    }

    %% 메뉴 및 권한 관련 테이블
    menus {
        int8 id PK
        varchar(50) menu_code UK
        varchar(100) menu_name
        varchar(100) menu_name_en
        int8 parent_id FK
        int4 menu_level
        int4 sort_order
        varchar(200) menu_url
        varchar(50) icon_class
        bool is_active
        bool is_visible
        text description
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    menu_permissions {
        int8 id PK
        int8 menu_id PK,FK
        varchar(50) role_name PK
        bool can_read
        bool can_write
        bool can_delete
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    %% 원장 및 직책 관련 테이블
    ledger_orders {
        int8 ledger_orders_id PK
        varchar(300) ledger_orders_title
        varchar(2) ledger_orders_status_cd
        varchar(2) ledger_orders_conf_cd
        timestamp created_at
        timestamp updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    positions {
        int8 positions_id PK
        int8 ledger_order FK
        varchar(200) positions_nm
        int8 approval_id FK
        varchar(10) write_dept_cd
        date date_expired
        varchar(10) confirm_gubun_cd
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    %% 결재 관련 테이블
    approval {
        int4 approval_id PK
        varchar(100) task_type_cd
        int8 task_id
        varchar(100) requester_id FK
        varchar(100) approver_id FK
        varchar(20) appr_stat_cd
        timestamptz request_datetime
        timestamptz approval_datetime
        text comments
        varchar(100) created_id
        varchar(100) updated_id
        timestamptz created_at
        timestamptz updated_at
    }

    approval_steps {
        int4 step_id PK
        int4 approval_id FK
        int4 step_order
        varchar(100) approver_id FK
        varchar(20) step_status
        timestamptz approved_datetime
        text comments
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    %% 책무 관련 테이블
    responsibility {
        int8 responsibility_id PK
        text responsibility_content
        int8 ledger_order FK
        int8 approval_id FK
        date date_expired
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    responsibility_detail {
        int8 responsibility_detail_id PK
        int8 responsibility_id FK
        text responsibility_detail_content
        text responsibility_mgt_sts
        text responsibility_rel_evid
        varchar(255) responsibility_use_yn
        timestamptz created_at
        timestamptz updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    %% 기타 테이블
    common_code {
        varchar(50) code PK
        varchar(50) group_code PK
        varchar(100) code_name
        timestamp(6) created_at
        varchar(255) description
        int4 sort_order
        timestamp(6) updated_at
        varchar(1) use_yn
        varchar(100) created_id
    }

    qna {
        int8 id PK
        varchar(100) department
        varchar(500) title
        text content
        varchar(100) questioner_id FK
        varchar(100) questioner_name
        text answer_content
        varchar(100) answerer_id FK
        varchar(100) answerer_name
        varchar(20) status
        varchar(10) priority
        varchar(50) category
        bool is_public
        int4 view_count
        timestamp answered_at
        timestamp created_at
        timestamp updated_at
        varchar(100) created_id
        varchar(100) updated_id
    }

    attachments {
        int8 attach_id PK
        varchar(255) original_name
        varchar(255) stored_name
        varchar(500) file_path
        int8 file_size
        varchar(100) mime_type
        varchar(50) entity_type
        int8 entity_id
        varchar(100) content_type
        varchar(100) uploaded_by FK
        timestamp(6) upload_date
        varchar(100) created_id
        varchar(100) updated_id
        timestamp(6) created_at
        timestamp(6) updated_at
        varchar(1) deleted_yn
        timestamp(6) deleted_at
        varchar(100) deleted_by
    }

    %% 관계 정의
    users ||--o{ user_roles : "사용자 역할 할당"
    users ||--o{ approval : "결재 요청자"
    users ||--o{ approval : "결재자"
    users ||--o{ approval_steps : "결재 단계별 결재자"
    users ||--o{ qna : "문의자"
    users ||--o{ qna : "답변자"
    users ||--o{ attachments : "파일 업로더"
    users ||--o{ positions : "직책 생성자"
    users ||--o{ responsibility : "책무 생성자"
    users ||--o{ responsibility_detail : "책무상세 생성자"

    departments ||--o{ users : "부서 소속"
    departments ||--o{ positions : "직책 작성부서"

    roles ||--o{ user_roles : "역할별 사용자"
    roles ||--o{ role_permissions : "역할별 권한"

    api_permissions ||--o{ role_permissions : "권한별 역할"

    menus ||--o{ menu_permissions : "메뉴별 권한"
    menus ||--o{ menus : "상위메뉴-하위메뉴"

    ledger_orders ||--o{ positions : "원장차수별 직책"
    ledger_orders ||--o{ responsibility : "원장차수별 책무"

    approval ||--o{ approval_steps : "결재별 단계"
    approval ||--o{ positions : "결재별 직책"
    approval ||--o{ responsibility : "결재별 책무"

    responsibility ||--o{ responsibility_detail : "책무별 상세내용"

    %% 인덱스 및 제약조건 정보
    %% users: dept_cd, email, username 인덱스
    %% departments: department_name 인덱스
    %% positions: ledger_order, write_dept_cd 인덱스
    %% approval: appr_stat_cd, approver_id, requester_id, task_id 인덱스
    %% approval_steps: approval_id, approver_id, step_status, step_order 인덱스
    %% responsibility_detail: responsibility_id, use_yn 인덱스
    %% qna: answerer_id, category, created_at, department, is_public, priority, questioner_id, status 인덱스
    %% attachments: entity_type+entity_id, upload_date, content_type, active 인덱스
```

## 주요 테이블 그룹별 설명

### 1. 사용자 및 인증 관리
- **users**: 사용자 기본 정보 (사번, 이름, 이메일, 부서 등)
- **departments**: 부서 정보
- **roles**: 역할 정의
- **user_roles**: 사용자별 역할 할당 (다대다 관계)
- **api_permissions**: API 권한 정의
- **role_permissions**: 역할별 권한 할당

### 2. 메뉴 및 UI 권한
- **menus**: 메뉴 구조 (계층형 구조 지원)
- **menu_permissions**: 메뉴별 역할 권한

### 3. 원장 및 직책 관리
- **ledger_orders**: 원장 차수 관리
- **positions**: 직책 정보 (원장 차수별)

### 4. 결재 시스템
- **approval**: 결재 기본 정보
- **approval_steps**: 결재 단계별 상세 정보

### 5. 책무 관리
- **responsibility**: 책무 기본 정보
- **responsibility_detail**: 책무 상세 내용

### 6. 공통 및 기타
- **common_code**: 공통 코드 관리
- **qna**: 문의 및 답변
- **attachments**: 범용 첨부파일 관리

## 설계 특징

1. **역할 기반 접근 제어 (RBAC)**: 사용자-역할-권한의 3계층 구조
2. **계층형 메뉴 구조**: 상위-하위 메뉴 관계 지원
3. **유연한 결재 시스템**: 다단계 결재 및 단계별 상태 관리
4. **범용 첨부파일**: entity_type과 entity_id를 통한 다양한 업무 연결
5. **감사 추적**: 모든 테이블에 생성자/수정자/생성일시/수정일시 정보 포함
6. **논리적 삭제**: attachments 테이블의 deleted_yn을 통한 논리적 삭제 지원

## 인덱스 전략

- **성능 최적화**: 자주 조회되는 컬럼에 대한 인덱스 설정
- **복합 인덱스**: entity_type + entity_id와 같은 복합 인덱스 활용
- **부분 인덱스**: deleted_yn = 'N' 조건의 부분 인덱스 사용












