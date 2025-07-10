-- public.positions_owner_dept definition

-- Drop table

-- DROP TABLE public.positions_owner_dept;

CREATE TABLE public.positions_owner_dept (
	positions_owner_dept_id bigserial NOT NULL,
	positions_id int8 NOT NULL,
	owner_dept_cd varchar(10) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT positions_owner_dept_pkey PRIMARY KEY (positions_owner_dept_id),
	CONSTRAINT fk_positions FOREIGN KEY (positions_id) REFERENCES public.positions(positions_id) ON DELETE CASCADE
);
