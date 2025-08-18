-- public.rm_submit_mgmt definition

-- Drop table

-- DROP TABLE public.rm_submit_mgmt;

CREATE TABLE public.rm_submit_mgmt (
	rm_submit_mgmt_id bigserial NOT NULL,
	submit_hist_cd varchar(100) NOT NULL,
	execofficer_id varchar(100) NOT NULL,
	rm_submit_dt date NULL,
	update_yn varchar(1) DEFAULT 'N'::character varying NULL,
	rm_submit_remarks varchar(1000) NULL,
  positions_id int8 NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	bank_cd varchar(100)  NULL,
  CONSTRAINT rm_submit_mgmt_pkey PRIMARY KEY (rm_submit_mgmt_id)
);
