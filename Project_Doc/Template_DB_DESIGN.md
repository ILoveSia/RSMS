# 부서관리 데이터설계서 (CM01003)

## 1. 테이블 정의
- 테이블명: branches

## 2. 컬럼 정의
| 컬럼명      | 타입      | PK | NN | UQ | 설명                |
|-------------|-----------|----|----|----|---------------------|
| branch_id   | CHAR(4)   | Y  | Y  | Y  | 부서번호, 0001~     |
| branch_name | VARCHAR   |    | Y  | Y  | 부서명(유니크)      |
| status      | CHAR(2)   |    | Y  |    | 상태(00-활동)       |
| created_at  | TIMESTAMP |    | Y  |    | 등록일시            |
| updated_at  | TIMESTAMP |    | Y  |    | 수정일시            |

## 3. 제약조건
- branch_id: 0001부터 자동채번, 중복불가
- branch_name: 유니크, NOT NULL, 팝업/조회 연동 가능
- status: '00' 고정(활동) 

## 4. PostgreSQL DDL 예시
```sql
-- 부서관리(branches) 테이블 생성 DDL (PostgreSQL)
CREATE SEQUENCE branches_branch_id_seq START 1;

CREATE TABLE branches (
    branch_id CHAR(4) PRIMARY KEY DEFAULT lpad(nextval('branches_branch_id_seq')::text, 4, '0'),
    branch_name VARCHAR(30) NOT NULL UNIQUE,
    status CHAR(2) NOT NULL DEFAULT '00',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE branches IS '시스템 부서관리';
COMMENT ON COLUMN branches.branch_id IS '부서번호(0001~)';
COMMENT ON COLUMN branches.branch_name IS '부서명';
COMMENT ON COLUMN branches.status IS '상태(00-활동)';
COMMENT ON COLUMN branches.created_at IS '등록일시';
COMMENT ON COLUMN branches.updated_at IS '수정일시';
``` 