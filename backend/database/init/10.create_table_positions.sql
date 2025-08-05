-- public.positions definition

-- Drop table

-- DROP TABLE public.positions CASCADE;

CREATE TABLE public.positions (
	positions_id bigserial NOT NULL,    -- 직책ID
	ledger_order int8 NOT NULL,    -- 원장차수ID
	positions_nm varchar(200) NULL,    -- 직책명
	approval_id int8 NULL,             -- 결재ID
	write_dept_cd varchar(10) NULL,    -- 작성부서코드
    date_expired date DEFAULT '9999-12-31'::date NULL, -- 만료일
    confirm_gubun_cd varchar(10) NULL, -- 확인구분코드
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT positions_pkey PRIMARY KEY (positions_id)
);
CREATE INDEX idx_positions_ledger_order ON public.positions USING btree (ledger_order);
CREATE INDEX idx_positions_write_dept_cd ON public.positions USING btree (write_dept_cd);

-- Table Triggers

create trigger update_positions_updated_at before
update
    on
    public.positions for each row execute function update_updated_at_column();
