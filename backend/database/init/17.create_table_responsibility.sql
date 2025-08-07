-- public.responsibility definition

-- Drop table

-- DROP TABLE public.responsibility CASCADE;

CREATE TABLE public.responsibility (
	responsibility_id bigserial NOT NULL, -- 책무ID
	responsibility_content text NULL,    -- 책무내용
    ledger_order int8 NULL,      -- 원장차수
	approval_id int8 NULL,               -- 결재ID
    date_expired date DEFAULT '9999-12-31'::date NULL, -- 만료일
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT responsibility_pkey PRIMARY KEY (responsibility_id)
);

-- Table Triggers

create trigger update_responsibility_updated_at before
update
    on
    public.responsibility for each row execute function update_updated_at_column();
