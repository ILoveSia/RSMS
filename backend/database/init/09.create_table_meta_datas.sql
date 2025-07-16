-- public.meta_datas definition

-- Drop table

-- DROP TABLE public.meta_datas;

CREATE TABLE public.meta_datas (
	"no" bigserial NOT NULL, -- 메타데이터ID
	meta_cat_cd varchar(100) NOT NULL, -- 메타카테고리코드
	meta_eng varchar(300) NOT NULL, -- 메타영문
	meta_kor varchar(300) NOT NULL, -- 메타한글
	meta_description varchar(1000) NULL, -- 메타설명
	use_yn varchar(1) DEFAULT 'Y'::character varying NOT NULL, -- 사용여부
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	CONSTRAINT meta_datas_pkey PRIMARY KEY (no)
);
