-- public.departments definition

-- Drop table

-- DROP TABLE public.departments;

CREATE TABLE public.departments (
	department_id varchar(20) NOT NULL,
	created_at timestamp(6) NOT NULL,
	created_id varchar(100) NULL,
	updated_at timestamp(6) NOT NULL,
	updated_id varchar(100) NULL,
	department_name varchar(100) NOT NULL,
	use_yn varchar(1) NOT NULL,
	CONSTRAINT departments_pkey PRIMARY KEY (department_id),
	CONSTRAINT ukqyf2ekbfpnddm6f3rkgt39i9o UNIQUE (department_name)
);