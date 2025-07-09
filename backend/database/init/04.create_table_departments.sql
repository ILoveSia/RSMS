-- public.departments definition

-- Drop table

-- DROP TABLE public.departments;

CREATE TABLE public.departments (
	department_id varchar(20) NOT NULL,
	department_name varchar(100) NOT NULL,
	use_yn varchar(1) DEFAULT 'Y'::character varying NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT departments_department_name_key UNIQUE (department_name),
	CONSTRAINT departments_pkey PRIMARY KEY (department_id)
);
CREATE INDEX idx_department_name ON public.departments USING btree (department_name);

-- Table Triggers

create trigger update_departments_updated_at before
update
    on
    public.departments for each row execute function update_updated_at_column();
