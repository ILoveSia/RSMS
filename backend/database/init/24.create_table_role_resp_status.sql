-- public.role_resp_status definition

-- Drop table

-- DROP TABLE public.role_resp_status CASCADE;
-- 직책별 책무 현황 테이블

CREATE TABLE public.role_resp_status (
	role_resp_status_id bigserial NOT NULL,   -- 직책별책무현황ID
	role_summ varchar(100) NULL,            -- 책무개요
	role_start_dt varchar(8) NULL,          -- 책무분배일
	ledger_order int8 NULL,         -- 책무번호
    approval_id int8 NULL,                   -- 결재ID
	positions_id int8 NOT NULL,             --직책ID
	responsibility_id int8 NOT NULL,         --책무ID
    date_expired date DEFAULT '9999-12-31'::date NULL, -- 만료일
	created_id varchar(100) NULL,            -- 생성자 ID
	updated_id varchar(100) NULL,            -- 수정자 ID
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	CONSTRAINT role_resp_status_pkey PRIMARY KEY (role_resp_status_id)
);
