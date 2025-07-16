-- public.positions_owner_dept definition

-- Drop table

-- DROP TABLE public.positions_owner_dept;

CREATE TABLE public.positions_owner_dept (
	positions_owner_dept_id bigserial NOT NULL, -- 직책책임부서ID
	positions_id int8 NOT NULL,                 -- 직책ID
	owner_dept_cd varchar(10) NULL,             -- 책임부서코드
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT positions_owner_dept_pkey PRIMARY KEY (positions_owner_dept_id),
	CONSTRAINT fk_positions FOREIGN KEY (positions_id) REFERENCES public.positions(positions_id) ON DELETE CASCADE
);
