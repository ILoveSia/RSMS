-- public.meta_datas definition

-- Drop table

-- DROP TABLE public.meta_datas;

CREATE TABLE public.meta_datas (
	"no" bigserial NOT NULL,
	meta_cat_cd varchar(100) NOT NULL,
	meta_eng varchar(300) NOT NULL,
	meta_kor varchar(300) NOT NULL,
	meta_description varchar(1000) NULL,
	use_yn varchar(1) DEFAULT 'Y'::character varying NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT meta_datas_pkey PRIMARY KEY (no)
);
