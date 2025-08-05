-- DROP TABLE public.execofficer CASCADE
-- 임원현황 테이블

CREATE TABLE public.execofficer (
    execofficer_id          bigserial               NOT NULL,               -- 임원현황ID
    emp_id                  VARCHAR(100)            NOT NULL,               -- 사원아이디(userID 사용)
    execofficer_dt          date                    NULL,                   -- 임원선임일
    pos_appt_dt             date                    NULL,                   -- 직책부여일
    dual_yn                 VARCHAR(1)              NULL,                   -- 겸직여부
    dual_details            VARCHAR(1000)           NULL,                   -- 겸직사항
    positions_id            int8                    NOT NULL,               -- 직책ID
    approval_id             int8                    NULL,                   -- 결재ID
    ledger_order            int8                    NULL,                   -- 원장차수
    date_expired            date DEFAULT '9999-12-31'::date NULL,           -- 만료일
    created_id              VARCHAR(100)            NULL,
    updated_id              VARCHAR(100)            NULL,
    created_at              timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 레코드 생성일
    updated_at              timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 레코드 수정일
    CONSTRAINT execofficer_pkey PRIMARY KEY (execofficer_id)
);
