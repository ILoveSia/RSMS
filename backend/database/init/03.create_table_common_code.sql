-- public.common_code definition

-- Drop table

-- DROP TABLE public.common_code;

CREATE TABLE public.common_code (
	code varchar(50) NOT NULL,
	group_code varchar(50) NOT NULL,
	code_name varchar(100) NOT NULL,
	created_at timestamp(6) NOT NULL,
	description varchar(255) NULL,
	sort_order int4 NOT NULL,
	updated_at timestamp(6) NOT NULL,
	use_yn varchar(1) NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT common_code_pkey PRIMARY KEY (code, group_code)
);
