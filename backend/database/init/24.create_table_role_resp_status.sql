-- public.role_resp_status definition

-- Drop table

-- DROP TABLE public.role_resp_status;

CREATE TABLE public.role_resp_status (
	role_resp_status_id bigserial NOT NULL,
	role_summ varchar(100) NULL,
	role_start_dt varchar(8) NULL,
	ledger_order varchar(100) NULL,
	order_status varchar(20) NULL,
  approval_id int8 NULL,
	positions_id int8 NOT NULL,
	responsibility_id int8 NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT role_resp_status_pkey PRIMARY KEY (role_resp_status_id)
);
