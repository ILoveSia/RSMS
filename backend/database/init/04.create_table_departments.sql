-- public.departments definition

-- Drop table

-- DROP TABLE public.departments;

CREATE TABLE public.departments (
	department_id varchar(20) NOT NULL, -- 부서ID
	department_name varchar(100) NOT NULL, -- 부서명
	use_yn varchar(1) DEFAULT 'Y'::character varying NOT NULL, -- 사용여부
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	CONSTRAINT departments_department_name_key UNIQUE (department_name),
	CONSTRAINT departments_pkey PRIMARY KEY (department_id)
);
CREATE INDEX idx_department_name ON public.departments USING btree (department_name);

-- Table Triggers

create trigger update_departments_updated_at before
update
    on
    public.departments for each row execute function update_updated_at_column();
