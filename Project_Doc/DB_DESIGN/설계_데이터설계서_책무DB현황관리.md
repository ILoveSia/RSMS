# 책무DB현황관리 데이터설계서 (RS03001M)

## 1. 테이블 정의

- 테이블명: responsibility (메인 테이블)
- 관련 테이블: responsibility_detail

## 2. 컬럼 정의

| 컬럼명                 | 타입         | PK  | NN  | UQ  | 설명                       |
| ---------------------- | ------------ | --- | --- | --- | -------------------------- |
| responsibility_id      | BIGSERIAL    | Y   | Y   | Y   | 책무 고유 식별자(자동증가) |
| responsibility_content | TEXT         |     |     |     | 책무 내용                  |
| ledger_order           | VARCHAR(100) |     |     |     | 원장차수 코드              |
| approval_id            | BIGINT       |     |     |     | 승인ID                     |
| order_status           | VARCHAR(20)  |     |     |     | 처리상태                   |
| created_at             | TIMESTAMPTZ  |     | Y   |     | 등록일시                   |
| updated_at             | TIMESTAMPTZ  |     | Y   |     | 수정일시                   |
| created_id             | VARCHAR(100) |     |     |     | 등록자 ID                  |
| updated_id             | VARCHAR(100) |     |     |     | 수정자 ID                  |

## 3. 제약조건

- responsibility_id: 기본키, BIGSERIAL 자동증가, 중복불가
- responsibility_content: 책무 내용, TEXT 타입, NULL 허용
- ledger_order: 공통코드 LEDGER_ORDER와 연계, NULL 허용
- approval_id: 승인 관련 정보, NULL 허용
- order_status: 처리상태 관리, NULL 허용
- created_at: 기본값 CURRENT_TIMESTAMP
- updated_at: 기본값 CURRENT_TIMESTAMP, 트리거로 자동 업데이트

## 4. 관련 테이블

- responsibility_detail: 책무 세부내용 정보 (1:N 관계)
  - responsibility_detail_content: 책무 세부내용
  - responsibility_mgt_sts: 책무이행을 위한 주요 관리업무
  - responsibility_rel_evid: 관련 근거
  - responsibility_use_yn: 사용여부 (Y/N, 기본값 'Y')

## 5. 인덱스

- idx_responsibility_detail_responsibility_id: responsibility_id 컬럼 인덱스
- idx_responsibility_detail_use_yn: responsibility_use_yn 컬럼 인덱스

## 6. PostgreSQL DDL 예시

```sql
-- 책무DB현황관리(responsibility) 테이블 생성 DDL (PostgreSQL)
CREATE TABLE public.responsibility (
    responsibility_id BIGSERIAL NOT NULL,
    responsibility_content TEXT NULL,
    ledger_order VARCHAR(100) NULL,
    approval_id INT8 NULL,
    order_status VARCHAR(20) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NULL,
    created_id VARCHAR(100) NULL,
    updated_id VARCHAR(100) NULL,
    CONSTRAINT responsibility_pkey PRIMARY KEY (responsibility_id)
);

-- 트리거 생성 (updated_at 자동 업데이트)
CREATE TRIGGER update_responsibility_updated_at
    BEFORE UPDATE ON public.responsibility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 세부내용 테이블 생성 (responsibility_detail)
CREATE TABLE public.responsibility_detail (
    responsibility_detail_id BIGSERIAL NOT NULL,
    responsibility_id INT8 NOT NULL,
    responsibility_detail_content TEXT NULL,
    responsibility_mgt_sts TEXT NULL,
    responsibility_rel_evid TEXT NULL,
    responsibility_use_yn VARCHAR(255) DEFAULT 'Y'::character varying NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NULL,
    created_id VARCHAR(100) NULL,
    updated_id VARCHAR(100) NULL,
    CONSTRAINT chk_responsibility_use_yn CHECK (((responsibility_use_yn)::text = ANY (ARRAY[('Y'::character varying)::text, ('N'::character varying)::text]))),
    CONSTRAINT responsibility_detail_pkey PRIMARY KEY (responsibility_detail_id),
    CONSTRAINT fk_responsibility_detail_responsibility FOREIGN KEY (responsibility_id) REFERENCES public.responsibility(responsibility_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_responsibility_detail_responsibility_id ON public.responsibility_detail USING btree (responsibility_id);
CREATE INDEX idx_responsibility_detail_use_yn ON public.responsibility_detail USING btree (responsibility_use_yn);

-- 테이블 및 컬럼 코멘트
COMMENT ON TABLE public.responsibility IS '책무DB현황관리';
COMMENT ON COLUMN public.responsibility.responsibility_id IS '책무 고유 식별자';
COMMENT ON COLUMN public.responsibility.responsibility_content IS '책무 내용';
COMMENT ON COLUMN public.responsibility.ledger_order IS '원장차수 코드';
COMMENT ON COLUMN public.responsibility.approval_id IS '승인ID';
COMMENT ON COLUMN public.responsibility.order_status IS '처리상태';
COMMENT ON COLUMN public.responsibility.created_at IS '등록일시';
COMMENT ON COLUMN public.responsibility.updated_at IS '수정일시';
COMMENT ON COLUMN public.responsibility.created_id IS '등록자 ID';
COMMENT ON COLUMN public.responsibility.updated_id IS '수정자 ID';

COMMENT ON TABLE public.responsibility_detail IS '책무 세부내용';
COMMENT ON COLUMN public.responsibility_detail.responsibility_detail_id IS '세부내용 고유 식별자';
COMMENT ON COLUMN public.responsibility_detail.responsibility_id IS '책무 ID (FK)';
COMMENT ON COLUMN public.responsibility_detail.responsibility_detail_content IS '책무 세부내용';
COMMENT ON COLUMN public.responsibility_detail.responsibility_mgt_sts IS '책무이행을 위한 주요 관리업무';
COMMENT ON COLUMN public.responsibility_detail.responsibility_rel_evid IS '관련 근거';
COMMENT ON COLUMN public.responsibility_detail.responsibility_use_yn IS '사용여부 (Y/N)';
```
