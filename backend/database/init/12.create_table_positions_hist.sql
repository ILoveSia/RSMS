-- public.positions_hist definition

-- Drop table

-- DROP TABLE public.positions_hist;

CREATE TABLE public.positions_hist (
	history_seq bigserial NOT NULL,
	history_id timestamp NOT NULL,
	positions_id int8 NOT NULL,
	ledger_order varchar(100) NULL,
	positions_nm varchar(200) NULL,
	confirm_gubun_cd varchar(10) NULL,
	write_dept_cd varchar(10) NULL,
	created_at timestamp NULL,
	updated_at timestamp NULL,
	history_gubun varchar(1) NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT positions_hist_pkey PRIMARY KEY (history_seq)
);
